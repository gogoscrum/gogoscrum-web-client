<template>
  <div
    ref="fileListPage"
    class="project-files-page page"
    v-infinite-scroll="loadMore"
    :infinite-scroll-immediate="false">
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
          <span class="item-count">{{
            filter.keyword
              ? $t('fileList.header.matchedResults', { count: totalElements })
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
            @input="keywordChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <breadcrumb v-if="breadcrumb && breadcrumb.length" :breadcrumb="breadcrumb" class="pl-18px" />
    <div class="main">
      <el-table
        :data="files"
        v-loading="loading"
        row-class-name="file-row clickable"
        :show-header="false"
        @row-click="fileClicked">
        <el-table-column
          :label="$t('fileList.list.name')"
          :min-width="isInMobile ? 150 : 250"
          class-name="icon-name-column">
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
                  @click.native.stop />
                <span
                  v-else
                  class="file-name"
                  v-html="scope.row.nameHighlightLabel || scope.row.name"
                  :data-index="scope.$index"></span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sizeFormatted" :label="$t('fileList.list.size')" min-width="50"> </el-table-column>
        <el-table-column v-if="!isInMobile" :label="$t('fileList.list.creator')" min-width="40">
          <template #default="scope">
            <el-tooltip
              v-if="scope.row.createdBy"
              :content="$t('fileList.list.creatorTip', { nickname: scope.row.createdBy.nickname })"
              placement="left">
              <avatar
                :name="scope.row.createdBy.nickname"
                :size="22"
                :src="scope.row.createdBy.avatarUrl"
                inline></avatar>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isInMobile"
          prop="createdTimeFormatted"
          :label="$t('fileList.list.createdTime')"
          min-width="80">
        </el-table-column>
        <el-table-column v-if="project.isDeveloper" :label="$t('common.actions')" width="50">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="Edit" @click.native="editFile(scope.$index, scope.row, false)">{{
                    $t('common.rename')
                  }}</el-dropdown-item>
                  <el-dropdown-item v-if="!scope.row.folder" icon="Download" @click.native="downloadFile(scope.row)">{{
                    $t('common.download')
                  }}</el-dropdown-item>
                  <el-dropdown-item icon="Delete" @click.native="deleteFile(scope.$index, scope.row)">{{
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
import { filesize } from 'filesize'
import { ElMessageBox } from 'element-plus'
import utils from '@/utils/util.js'
import Avatar from '@/components/common/Avatar.vue'
import { ElMessage } from 'element-plus'
import OfficeViewer from '@/components/common/OfficeViewer.vue'
import PdfViewer from '@/components/common/PdfViewer.vue'
import dayjs from 'dayjs'
import util from '@/utils/util.js'

export default {
  name: 'FileList',
  components: {
    Avatar,
    Breadcrumb,
    FileIcon,
    OfficeViewer,
    PdfViewer
  },
  data() {
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
        targetType: this.$route.query.targetType || 'PROJECT_FILE',
        page: 1,
        pageSize: 20
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
      pdfFile: null
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
  },
  mounted() {
    this.loadFiles()
  },
  methods: {
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
    loadFiles(append = false) {
      this.loading = true
      fileApi.search(this.filter).then((res) => {
        let results = highlight.highlight(res.data.results, this.filter.keyword, 'name')
        results.forEach((file) => {
          this.formatFile(file)
        })
        this.files = append ? this.files.concat(results) : results
        this.totalElements = res.data.totalElements
        this.totalPages = res.data.totalPages

        // Since the DOM of the file list is in the middle of the page container (this.$refs.fileListPage), so we need to
        // manually scroll the page up a little bit to avoid the loadMore event being always triggered
        this.$nextTick(() => {
          this.$refs.fileListPage.parentElement.scrollBy(0, results.length * -57)
        })

        // Delay a little bit to improve user experience
        setTimeout(() => {
          this.loading = false
        }, 200)
      })
    },
    loadMore() {
      if (!this.loading && this.totalPages > this.filter.page) {
        this.filter.page++
        this.loadFiles(true)
      }
    },
    refreshFileList() {
      this.filter.page = 1
      this.loadFiles()
    },
    formatFile(file) {
      if (file.size) {
        file.sizeFormatted = filesize(file.size, { round: 1 })
      } else {
        file.sizeFormatted = '--'
      }

      return util.formatCreateUpdateTime(file)
    },
    keywordChanged() {
      this.filter.page = 1
      this.files = []

      if (this.filter.keyword) {
        this.filter.rootLevel = false
        this.filter.parentId = null
        this.breadcrumb = []
        this.loadFiles()
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
          this.loadFiles()
        }
      }
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

        return uploader.initUploadParams(file, this.projectId, 'PROJECT_FILE').then((params) => {
          this.uploadParams = params
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
        fullPath: uploadRes,
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
      margin-left: 16px;
      line-height: 32px;
    }
  }
}
</style>

<style lang="less">
.project-files-page {
  .file-row {
    .cell {
      display: flex;
    }

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
