<template>
  <div class="project-files-page page">
    <div class="filter-row">
      <div class="left-part">
        <el-button
          :disabled="!project.isDeveloper"
          text
          type="primary"
          @click="newFolder"
          icon="CirclePlusFilled"
          class="text-icon-btn new-folder-btn"
          >{{ $t('fileList.header.newFolder') }}</el-button
        >
        <el-upload
          :action="uploadParams.uploadActionUrl"
          :before-upload="initUploadParams"
          :data="uploadParams"
          multiple
          :limit="5"
          :on-exceed="onExceed"
          :on-success="fileUploadSuccess"
          :show-file-list="false">
          <el-button
            :disabled="!project.isDeveloper"
            :loading="uploading"
            text
            type="primary"
            icon="UploadFilled"
            class="text-icon-btn"
            >{{ $t('fileList.header.uploadFile') }}</el-button
          >
        </el-upload>
      </div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="refreshFileList" class="refresh-btn">
            <Refresh />
          </el-icon>
          <column-selector
            v-model="columns"
            :available-columns="availableColumns"
            store-key="fileListColumns"></column-selector>
          <span class="item-count">{{
            filter.keyword
              ? $t('common.filter.matchedResults', { count: totalElements })
              : $t('fileList.header.folderOrFiles', { count: totalElements })
          }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('fileList.header.search')"
            @input="inputChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <breadcrumb v-if="breadcrumb && breadcrumb.length" :breadcrumb="breadcrumb" class="pl-18px" />
    <div class="main">
      <el-table
        :data="files"
        v-loading="loading"
        row-class-name="file-row clickable"
        :show-header="true"
        @sort-change="sortChange"
        @filterChange="filterChange"
        @row-click="fileClicked">
        <el-table-column
          :label="$t('fileList.list.name')"
          sortable="custom"
          sort-by="name, createdTime"
          column-key="otherFlags"
          :filters="otherFlags"
          :filter-multiple="true"
          show-overflow-tooltip
          :min-width="isInMobile ? 150 : 300"
          class-name="icon-name-column">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.folder !== null }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <div
              :class="`icon-name-container clickable ${draggedFileIndex == scope.$index ? 'dragged' : ''} 
                ${dragoverFileIndex == scope.$index ? 'dragover' : ''}`"
              draggable="true"
              @dragstart="dragstart"
              @dragend="dragend"
              @dragover="dragover"
              @dragenter="dragenter"
              @dragleave="dragleave"
              @drop="fileDropped"
              :data-index="scope.$index">
              <div class="file-icon-container">
                <img
                  v-if="scope.row.folder"
                  draggable="false"
                  class="folder-icon-img"
                  src="/src/assets/images/folder.png" />
                <el-image
                  v-else-if="scope.row.type === 'IMAGE'"
                  fit="contain"
                  :src="scope.row.url"
                  class="file-thumbnail" />
                <file-icon v-else :type="scope.row.type" size="small" />
              </div>
              <div class="file-name-container">
                <el-input
                  v-if="editingFile?.id === scope.row.id"
                  v-model="scope.row.name"
                  :ref="`fileNameInput-${editingFile.id}`"
                  size="default"
                  class="file-name-input"
                  @keyup.enter="finishEditingFile"
                  @keyup.esc="discardEditingFile"
                  @blur="finishEditingFile"
                  @click.stop />
                <span
                  v-else
                  class="file-name"
                  v-html="scope.row.nameHighlightLabel || scope.row.name"
                  :data-index="scope.$index"></span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('creator') && !isInMobile"
          :label="$t('common.createdBy')"
          sortable="custom"
          sort-by="createdBy.nickname, createdTime"
          column-key="creators"
          :filters="userFilters"
          :filter-multiple="true"
          min-width="120"
          class-name="owner-column">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.creators?.length }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <avatar
              :name="scope.row.createdBy.nickname"
              :size="22"
              :src="scope.row.createdBy.avatarUrl"
              showName></avatar>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('createdTime') && !isInMobile"
          prop="createdTimeFormatted"
          :label="$t('common.createdTime')"
          sortable="custom"
          sort-by="createdTime"
          min-width="130">
        </el-table-column>
        <el-table-column
          v-if="columns.includes('size')"
          prop="sizeFormatted"
          :label="$t('fileList.list.size')"
          sortable="custom"
          sort-by="size, createdTime"
          width="120"
          align="right">
        </el-table-column>
        <el-table-column
          v-if="columns.includes('actions') && project.isDeveloper"
          :label="$t('common.actions')"
          width="80"
          align="center">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="Edit" @click="editFile(scope.$index, scope.row, false)">{{
                    $t('common.rename')
                  }}</el-dropdown-item>
                  <el-dropdown-item v-if="!scope.row.folder" icon="Download" @click="downloadFile(scope.row)">{{
                    $t('common.download')
                  }}</el-dropdown-item>
                  <el-dropdown-item icon="Delete" @click="deleteFile(scope.$index, scope.row)">{{
                    $t('common.delete')
                  }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template v-slot:empty>
          <el-empty
            :image-size="100"
            :description="folderId ? $t('fileList.list.noFileInFolder') : $t('fileList.list.noFileInProject')">
            <el-upload
              :action="uploadParams.uploadActionUrl"
              :before-upload="initUploadParams"
              :data="uploadParams"
              multiple
              :limit="5"
              :on-exceed="onExceed"
              :on-success="fileUploadSuccess"
              :show-file-list="false">
              <el-button
                :disabled="!project.isDeveloper"
                :loading="uploading"
                type="primary"
                icon="UploadFilled"
                class="text-icon-btn"
                >{{ $t('fileList.header.uploadFile') }}</el-button
              >
            </el-upload>
          </el-empty>
        </template>
      </el-table>
      <div class="table-footer">
        <el-pagination
          :current-page="filter.page"
          :page-count="totalPages"
          size="small"
          :page-sizes="[10, 15, 20, 25, 50]"
          :default-page-size="filter.pageSize"
          :hide-on-single-page="filter.pageSize <= 10"
          background
          layout="prev, pager, next, sizes"
          @current-change="pageChanged"
          @size-change="pageSizeChanged">
        </el-pagination>
      </div>
      <el-image-viewer
        v-if="previewingImg"
        :url-list="imgPreviewSrcList"
        :infinite="false"
        :hide-on-click-modal="true"
        :initial-index="imgPreviewIndex"
        @close="closeImgPreview" />
      <el-dialog
        v-if="videoPlaying"
        v-model="videoDialogVisible"
        :title="videoPlaying?.name"
        draggable
        align-center
        width="680px"
        class="video-preview-dialog"
        @close="videoPlaying = null">
        <video v-if="videoPlaying.type == 'VIDEO'" :src="videoPlaying.url" controls class="w-full"></video>
        <audio v-else-if="videoPlaying.type == 'AUDIO'" :src="videoPlaying.url" controls class="w-full"></audio>
      </el-dialog>
      <OfficeViewer v-if="officeFile" :file="officeFile" @close="officeFile = null" />
      <PdfViewer v-if="pdfFile" :file="pdfFile" @close="pdfFile = null" />
    </div>
  </div>
</template>

<script>
import Breadcrumb from '@/components/common/Breadcrumb.vue'
import { fileApi } from '@/api/file.js'
import uploader from '@/utils/uploader.js'
import highlight from '@/utils/highlight.js'
import FileIcon from '@/components/common/FileIcon.vue'
import ColumnSelector from '@/components/common/ColumnSelector.vue'
import { filesize } from 'filesize'
import { ElMessageBox } from 'element-plus'
import utils from '@/utils/util.js'
import Avatar from '@/components/common/Avatar.vue'
import { ElMessage } from 'element-plus'
import OfficeViewer from '@/components/common/OfficeViewer.vue'
import PdfViewer from '@/components/common/PdfViewer.vue'
import util from '@/utils/util.js'

export default {
  name: 'FileList',
  components: {
    Avatar,
    Breadcrumb,
    ColumnSelector,
    FileIcon,
    OfficeViewer,
    PdfViewer
  },
  data() {
    const availableColumns = [
      { key: 'name', labelKey: 'fileList.list.name', default: true, readonly: true },
      { key: 'createdTime', labelKey: 'fileList.list.createdTime', default: true },
      { key: 'creator', labelKey: 'fileList.list.creator', default: true },
      { key: 'size', labelKey: 'fileList.list.size', default: true },
      { key: 'actions', labelKey: 'common.actions', default: true, readonly: true }
    ]
    const defaultColumns = availableColumns.filter((column) => column.default).map((column) => column.key)

    return {
      isInMobile: utils.isInMobile(),
      projectId: null,
      project: {},
      folderId: null,
      breadcrumb: [],
      files: [],
      imgPreviewSrcList: [],
      imgPreviewIndex: null,
      previewingImg: false,
      filter: {
        projectId: null,
        rootLevel: true,
        keyword: null,
        folder: null,
        creators: null,
        orders: [],
        targetType: this.$route.query.targetType || 'PROJECT_FILE',
        page: 1,
        pageSize: this.$store.get('fileListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: true,
      editingFile: {},
      uploadParams: {},
      uploading: false,
      draggedFileIndex: null,
      dragoverFileIndex: null,
      videoPlaying: null,
      videoDialogVisible: false,
      officeFile: null,
      pdfFile: null,
      fileIdUrlMap: {},
      otherFlags: [
        { text: this.$t('fileList.folder'), value: 'FOLDER' },
        { text: this.$t('fileList.file'), value: 'FILE' }
      ],
      userFilters: [],
      columns: this.$store.get('fileListColumns') || defaultColumns,
      availableColumns
    }
  },
  created() {
    this.projectId = this.$route.params.projectId
    this.folderId = this.$route.params.folderId
    this.filter.projectId = this.projectId

    if (this.filter.targetType === 'ALL') {
      this.filter.targetType = ''
    }

    this.project = this.$store.get('project')

    if (this.folderId) {
      this.filter.parentId = this.folderId
      this.filter.rootLevel = false
      this.loadFolder()
    }

    this.initColumnFilters()
  },
  mounted() {
    this.loadFiles()
  },
  methods: {
    initColumnFilters() {
      this.userFilters = (this.project.projectMembers || []).map((member) => ({
        text: member.user.nickname,
        value: member.user.id
      }))
    },
    loadFolder() {
      if (this.folderId) {
        fileApi.getById(this.folderId).then((res) => {
          this.folder = res.data
          this.insertBreadcrumbNode(this.folder)
        })
      }
    },
    insertBreadcrumbNode(folder) {
      this.breadcrumb.unshift({
        label: folder.name,
        route: { name: 'Folder', params: { folderId: folder.id } }
      })

      if (folder.parent) {
        this.insertBreadcrumbNode(folder.parent)
      } else {
        this.breadcrumb.unshift({
          label: this.$t('fileList.files'),
          route: { name: 'FileList', params: { projectId: this.projectId } }
        })
      }
    },
    loadFiles() {
      this.loading = true
      fileApi.search(this.filter).then((res) => {
        let results = highlight.highlight(res.data.results, this.filter.keyword, 'name')
        results.forEach((file) => {
          this.formatFile(file)
        })
        this.files = results
        this.totalElements = res.data.totalElements
        this.totalPages = res.data.totalPages
        this.filter.page = res.data.currentPage || this.filter.page

        // Delay a little bit to improve user experience
        setTimeout(() => {
          this.loading = false
        }, 200)
      })
    },
    refreshFileList() {
      this.reloadList()
    },
    formatFile(file) {
      if (file.size) {
        file.sizeFormatted = filesize(file.size, { round: 1 })
      } else {
        file.sizeFormatted = '--'
      }

      return util.formatCreateUpdateTime(file)
    },
    inputChanged() {
      // throttle keyword input changes
      if (this.inputTimeout) {
        clearTimeout(this.inputTimeout)
      }
      this.inputTimeout = setTimeout(() => {
        this.keywordChanged()
      }, 500)
    },
    keywordChanged() {
      if (this.filter.keyword) {
        this.filter.rootLevel = false
        this.filter.parentId = null
        this.breadcrumb = []
        this.reloadList()
      } else {
        if (this.folderId) {
          this.$router.push({
            name: 'FileList',
            params: { projectId: this.projectId }
          })
        } else {
          this.filter.rootLevel = true
          this.filter.parentId = null
          this.loadFolder()
          this.reloadList()
        }
      }
    },
    reloadList() {
      this.filter.page = 1
      this.loadFiles()
    },
    pageChanged(page) {
      this.filter.page = page
      this.loadFiles()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.filter.page = 1
      this.$store.set('fileListPageSize', this.filter.pageSize)
      this.loadFiles()
    },
    sortChange(event) {
      this.filter.orders = utils.getSortOrders(event) || []
      this.reloadList()
    },
    filterChange(filters) {
      if (filters.otherFlags) {
        if (filters.otherFlags.length === 1) {
          this.filter.folder = filters.otherFlags.includes('FOLDER')
        } else {
          this.filter.folder = null
        }
      }

      if (filters.creators) {
        this.filter.creators = filters.creators.length > 0 ? filters.creators : null
      }

      this.reloadList()
    },
    dragstart(event) {
      this.draggedFileIndex = event.srcElement.dataset.index
    },
    dragend(event) {
      this.draggedFileIndex = null
      this.dragoverFileIndex = null
    },
    dragover(event) {
      event.preventDefault()
      this.dragoverFileIndex = event.srcElement.dataset.index
    },
    dragenter(event) {},
    dragleave(event) {
      this.dragoverFileIndex = null
    },
    fileDropped(event) {
      event.preventDefault()
      let sourceFileIndex = this.draggedFileIndex
      let targetFileIndex = event.srcElement.dataset.index
      let targetFile = this.files[targetFileIndex]

      if (sourceFileIndex != targetFileIndex && targetFile.folder) {
        let draggedFile = this.files[sourceFileIndex]
        draggedFile.parent = targetFile

        fileApi.save(draggedFile).then((res) => {
          this.files.splice(sourceFileIndex, 1)
          ElMessage.success({
            message: this.$t('fileList.msg.fileMoved')
          })
        })
      } else {
        console.log('Target dropped file is not a folder or is itself, event ignored')
      }
    },
    newFolder() {
      let folder = {
        folder: true,
        name: this.$t('fileList.msg.newFolderName'),
        projectId: this.projectId
      }

      if (this.folderId) {
        folder.parent = { id: this.folderId }
      }

      fileApi.save(folder).then((res) => {
        this.formatFile(res.data)
        this.files.unshift(res.data)
        this.editFile(0, res.data, true)
      })
    },
    newFile() {
      this.editingFile = {}
    },
    editFile(index, row, selectAll) {
      this.editingFile = row
      this.editingIndex = index
      this.originalFileName = row.name

      setTimeout(() => {
        let input = this.$refs[`fileNameInput-${this.editingFile.id}`]
        input.focus()
        if (selectAll) {
          input.select()
        }
      }, 350)
    },
    finishEditingFile() {
      if (!this.saving) {
        if (!this.editingFile.name) {
          // Restore to original name if input is empty
          this.editingFile.name = this.originalFileName
        }
        if (this.originalFileName !== this.editingFile.name) {
          this.saveFile(this.editingIndex, this.editingFile)
          this.saving = true
        }
        this.editingFile = null
        this.editingIndex = null
        this.originalFileName = null
      }
    },
    discardEditingFile() {
      this.editingFile.name = this.originalFileName
      this.editingFile = null
      this.editingIndex = null
    },
    saveFile(index, file) {
      fileApi.save(file).then((res) => {
        let savedFile = res.data
        this.files.splice(index, 1, savedFile)
        this.formatFile(savedFile)
        ElMessage.success({
          message: this.$t('fileList.msg.fileSaved')
        })
        this.saving = false
      })
    },
    deleteFile(index, row) {
      let type = ''
      let confirmMsg = ''
      if (row.folder) {
        type = this.$t('fileList.folder')
        confirmMsg = this.$t('fileList.msg.delFolderConfirmMsg', {
          name: row.name
        })
      } else {
        type = this.$t('fileList.file')
        confirmMsg = this.$t('fileList.msg.delFileConfirmMsg', {
          name: row.name
        })
      }

      ElMessageBox.confirm(confirmMsg, this.$t('fileList.msg.delConfirmTitle', { type: type }), {
        type: 'warning',
        dangerouslyUseHTMLString: true,
        draggable: true
      })
        .then(() => {
          fileApi.delete(row.id).then((response) => {
            this.files.splice(index, 1)
            this.totalElements--
            ElMessage.success({
              message: this.$t('fileList.msg.delSuccess', { type: type })
            })
          })
        })
        .catch((err) => {
          // Cancelled, do nothing
        })
    },
    fileClicked(file) {
      if (file.folder) {
        this.$router.push({ name: 'Folder', params: { folderId: file.id } })
      } else if (file.type === 'IMAGE') {
        this.previewImg(file)
      } else if (file.type == 'VIDEO' || file.type == 'AUDIO') {
        this.videoPlaying = file
        this.videoDialogVisible = true
      } else if (file.type == 'WORD' || file.type == 'PPT' || file.type == 'EXCEL') {
        // For Office files, we cannot preview them for now, so we download them instead
        this.downloadFile(file)

        // TODO: Implement Office file preview
        // const fullUrl = utils.toFullUrl(file.url)
        // console.log('Office file URL:', fullUrl)
        // if (utils.isLocalhost(fullUrl)) {
        //   this.downloadFile(file)
        //   console.warn('Local file cannot preview, downloading instead:', file.url)
        // } else {
        //   this.officeFile = file
        // }
      } else if (file.type == 'PDF') {
        this.pdfFile = file
      } else {
        this.downloadFile(file)
      }
    },
    downloadFile(file) {
      fileApi.getFileBlob(file.url).then((res) => {
        utils.downloadFile(res.data, file.name)
      })
    },
    previewImg(file) {
      this.initImgPreviewSrcList(file)
      this.previewingImg = true
    },

    initImgPreviewSrcList(file) {
      this.imgPreviewSrcList = []
      this.imgPreviewIndex = 0

      if (this.files?.length) {
        this.files.forEach((file) => {
          if (file.type === 'IMAGE') {
            this.imgPreviewSrcList.push(file.url)
          }
        })
      }
      this.imgPreviewIndex = this.imgPreviewSrcList.indexOf(file.url)
    },
    closeImgPreview() {
      this.previewingImg = false
    },
    initUploadParams(file) {
      const tooLarge = file.size / 1024 / 1024 > 100
      if (tooLarge) {
        ElMessage.warning({
          message: this.$t('fileList.msg.fileSizeLimit')
        })
        return false
      } else {
        this.uploading = true

        return uploader
          .initUploadParams(file, this.projectId, 'PROJECT_FILE')
          .then((params) => {
            this.uploadParams = params
            this.fileIdUrlMap[file.uid || file.lastModified] = params.targetFileUrl
          })
          .catch((err) => {
            console.error('Error initializing upload params:', err)
            this.uploading = false
            return false
          })
      }
    },
    onExceed(files, fileList) {
      if (files.length > 5) {
        ElMessage.warning({
          message: this.$t('fileList.msg.tooManyFilesToUpload', {
            count: files.length
          })
        })
      }
    },

    fileUploadSuccess: function (uploadRes, file) {
      const fileDto = {
        name: file.name,
        fullPath: uploadRes || this.fileIdUrlMap[file.uid || file.lastModified] || this.uploadParams.targetFileUrl,
        type: uploader.getFileType(file.raw.type),
        size: file.size,
        targetType: 'PROJECT_FILE',
        projectId: this.projectId,
        storageProvider: this.uploadParams.provider,
        urlPrefix: this.uploadParams.urlPrefix,
        parent: this.folderId ? { id: this.folderId } : null
      }

      fileApi
        .save(fileDto)
        .then((res) => {
          let savedFile = this.formatFile(res.data)
          ElMessage.success({
            message: this.$t('fileList.msg.fileUploaded')
          })

          // Insert the new file right after all the folders
          const lastFolderIndex = this.files.findLastIndex((f) => f.folder)
          if (lastFolderIndex !== -1) {
            this.files.splice(lastFolderIndex + 1, 0, savedFile)
          } else {
            this.files.unshift(savedFile)
          }
        })
        .finally(() => {
          this.uploading = false
        })
    }
  }
}
</script>

<style lang="less" scoped>
.project-files-page {
  .file-row {
    .folder-icon-img {
      height: 32px;
      width: 32px;
      object-fit: contain;
    }

    .file-thumbnail {
      width: 32px;
      height: 32px;

      img {
        object-fit: contain;
      }
    }

    .file-name {
      margin-left: 12px;
      line-height: 32px;
    }
  }
}
</style>

<style lang="less">
.project-files-page {
  .file-row {
    .icon-name-container {
      display: flex;
      padding: 0 5px;
      flex-grow: 1;

      &.dragged {
        opacity: 0.5;
      }

      &.dragover {
        background-color: #f0f0f0;
        border-radius: 5px;
      }

      .file-icon-container {
        height: 32px;
      }

      .file-name-container {
        flex-grow: 1;

        .file-name-input {
          margin-left: 5px;

          .el-input__wrapper {
            height: 32px;
            line-height: 32px;
          }
        }
      }
    }
  }
}
</style>
