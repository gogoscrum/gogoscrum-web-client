<template>
  <div class="file-uploader-wrapper">
    <div class="file-card-list">
      <template v-if="mode === 'CARD'" v-for="(file, index) in fileList" :key="file.id">
        <div class="file-item">
          <el-tooltip :content="file.name" placement="top">
            <el-image
              v-if="file.type === 'IMAGE'"
              :src="file.url"
              :preview-teleported="true"
              :preview-src-list="imgPreviewSrcList"
              :initial-index="index"
              :hide-on-click-modal="true"
              :z-index="9999"
              fit="contain"
              class="file-img" />
            <a v-else @click="fileClicked(file)"><FileIcon :type="file.type" class="file-img" /></a>
          </el-tooltip>
          <el-icon
            v-if="!readonly"
            class="img-action-icon delete-img-icon"
            :title="$t('common.delete')"
            @click="deleteFile(index, file)">
            <Delete />
          </el-icon>
          <el-icon class="img-action-icon download-img-icon" :title="$t('common.download')" @click="downloadFile(file)">
            <Download />
          </el-icon>
        </div>
      </template>

      <el-table v-else :data="fileList" :show-header="false" class="file-table-list tight-table">
        <el-table-column :label="$t('uploader.thumbnail')" width="60">
          <template #default="scope">
            <div class="h-32px">
              <el-image
                v-if="scope.row.type === 'IMAGE'"
                :src="scope.row.url"
                :preview-teleported="true"
                :preview-src-list="imgPreviewSrcList"
                :initial-index="scope.$index"
                :hide-on-click-modal="true"
                :z-index="9999"
                fit="contain"
                class="file-img" />
              <a v-else @click="fileClicked(scope.row)"
                ><FileIcon :type="scope.row.type" size="small" class="file-img"
              /></a>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" :label="$t('fileList.list.name')" min-width="120" />
        <el-table-column prop="sizeFormatted" :label="$t('fileList.list.size')" min-width="40" />
        <el-table-column prop="createdBy.nickname" :label="$t('fileList.list.creator')" min-width="40">
          <template #default="scope">
            <Avatar
              v-if="scope.row.createdBy"
              :name="scope.row.createdBy.nickname"
              :size="22"
              :src="scope.row.createdBy.avatarUrl"
              show-name
              inline></Avatar>
          </template>
        </el-table-column>
        <el-table-column prop="createdTimeFormatted" :label="$t('fileList.list.createdTime')" min-width="70" />
        <el-table-column :label="$t('common.actions')" width="50" align="center">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="Download" @click.native="downloadFile(scope.row)">{{
                    $t('common.download')
                  }}</el-dropdown-item>
                  <el-dropdown-item
                    v-if="!readonly"
                    icon="Delete"
                    @click.native="deleteFile(scope.$index, scope.row)"
                    >{{ $t('common.delete') }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <el-upload
        v-if="!readonly"
        ref="fileUploaderRef"
        v-loading="uploading"
        :action="uploadParams.uploadActionUrl"
        drag
        :before-upload="initUploadParams"
        :data="uploadParams"
        :on-exceed="onExceed"
        :on-error="uploadError"
        :on-success="uploadSuccess"
        :show-file-list="false"
        :multiple="multiple"
        :limit="limit"
        class="file-uploader">
        <el-icon><Plus /></el-icon>
      </el-upload>
    </div>

    <div class="flex items-center">
      <div v-if="!readonly" class="form-field-tip !mt-0 mr-4">{{ $t('uploader.uploaderDesc') }}</div>
      <el-button v-if="fileList.length" type="primary" text size="small" @click="switchMode" class="!h-24px">{{
        mode === 'CARD' ? $t('uploader.switchToTableView') : $t('uploader.switchToCardView')
      }}</el-button>
    </div>

    <div v-if="readonly && fileList.length === 0" class="desc">
      {{ $t('test.case.edit.filesEmpty') }}
    </div>
  </div>
</template>

<script>
import FileIcon from '@/components/common/FileIcon.vue'
import Avatar from '@/components/common/Avatar.vue'
import uploader from '@/utils/uploader.js'
import utils from '@/utils/util.js'
import { filesize } from 'filesize'
import { fileApi } from '@/api/file.js'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'FileUploader',
  components: {
    Avatar,
    FileIcon
  },
  emits: ['fileUploaded', 'fileDeleted'],
  props: {
    files: {
      type: Array,
      default: () => []
    },
    readonly: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: true
    },
    limit: {
      type: Number,
      default: 5
    },
    maxSizeMbMb: {
      type: Number,
      default: 100 // 100MB
    },
    projectId: {
      type: String,
      default: ''
    },
    targetType: {
      type: String,
      default: ''
    }
  },
  computed: {
    imgPreviewSrcList() {
      return this.fileList.filter((file) => file.type === 'IMAGE').map((file) => file.url)
    }
  },
  data() {
    return {
      mode: 'CARD',
      fileList: [],
      uploadParams: {},
      uploading: false
    }
  },
  watch: {
    files(newFiles) {
      this.fileList = Object.assign([], newFiles)
      this.fileList.forEach((file) => {
        this.formatFile(file)
      })
    }
  },
  mounted() {},
  methods: {
    formatFile(file) {
      if (file.size) {
        file.sizeFormatted = filesize(file.size, { round: 1 })
      } else {
        file.sizeFormatted = '--'
      }
      utils.formatCreateUpdateTime(file)
    },
    switchMode() {
      this.mode = this.mode === 'CARD' ? 'TABLE' : 'CARD'
    },
    initUploadParams(file) {
      const tooLarge = file.size / 1024 / 1024 > this.maxSizeMb
      if (tooLarge) {
        ElMessage.warning({
          message: this.$t('common.msg.fileSizeLimit', { maxSizeMb: `${this.maxSizeMb} MB` })
        })
        return false
      } else {
        this.uploading = true

        return uploader
          .initUploadParams(file, this.projectId, this.targetType)
          .then((params) => {
            this.uploadParams = params
          })
          .catch((err) => {
            console.error('Error initializing upload params:', err)
            this.uploading = false
            return false
          })
      }
    },
    onExceed(files, fileList) {
      console.warn('File upload limit exceeded:', files, fileList)
      if (files.length > this.limit) {
        ElMessage.warning({
          message: this.$t('common.msg.tooManyFiles', { maxCount: this.limit })
        })
      }
    },
    uploadError(err, file) {
      this.uploading = false
      ElMessage.error({
        message: this.$t('common.msg.uploadFailed')
      })
      console.error('File upload error:', err)
    },
    uploadSuccess(uploadRes, file) {
      const fileDto = {
        name: file.name,
        fullPath: uploadRes || this.uploadParams.targetFileUrl,
        type: uploader.getFileType(file.raw.type),
        size: file.size,
        projectId: this.projectId,
        targetType: this.targetType,
        storageProvider: this.uploadParams.provider,
        urlPrefix: this.uploadParams.urlPrefix
      }

      fileApi
        .save(fileDto)
        .then((res) => {
          this.formatFile(res.data)
          this.fileList.push(res.data)
          this.$emit('fileUploaded', res.data)
        })
        .finally(() => {
          this.uploading = false
          this.$refs.fileUploaderRef.clearFiles()
        })
    },
    deleteFile(index, file) {
      ElMessageBox.confirm(
        this.$t('common.msg.delFileConfirmMsg', { name: file.name }),
        this.$t('common.msg.delFileConfirmTitle'),
        {
          dangerouslyUseHTMLString: true,
          type: 'warning',
          draggable: true
        }
      )
        .then(() => {
          fileApi.delete(file.id).then(() => {
            ElMessage.success({
              message: this.$t('common.msg.delFileSuccess')
            })
            this.fileList.splice(index, 1)
            this.$emit('fileDeleted', file)
          })
        })
        .catch(() => {
          // User cancelled, do nothing
        })
    },
    downloadFile(file) {
      fileApi.getFileBlob(file.url).then((res) => {
        utils.downloadFile(res.data, file.name)
      })
    }
  }
}
</script>

<style lang="less" scoped>
.file-uploader-wrapper {
  flex-grow: 1;

  .file-card-list {
    display: flex;
    flex-wrap: wrap;

    .file-item {
      position: relative;
      display: flex;
      margin-bottom: 10px;

      .file-img {
        width: 50px;
        height: 50px;
        margin-right: 10px;

        img {
          object-fit: contain;
        }
      }

      .img-action-icon {
        position: absolute;
        color: #666666;
        font-size: 12px;
        cursor: pointer;
        visibility: hidden;
        background-color: #cccccc;
        padding: 3px;
        border-radius: 50%;

        &:hover {
          background-color: #999999;
          color: #ffffff;
        }
      }

      .delete-img-icon {
        top: -3px;
        right: 6px;
      }

      .download-img-icon {
        left: -3px;
        top: -3px;
      }

      &:hover {
        .img-action-icon {
          visibility: visible;
        }
      }
    }
  }

  .file-table-list {
    margin-bottom: 16px;
    .file-img {
      width: 32px;
      height: 32px;

      img {
        object-fit: contain;
      }
    }
  }
}
</style>
<style lang="less">
.file-uploader-wrapper {
  .file-uploader {
    margin-bottom: 10px;
    .el-upload {
      width: 50px;
      height: 50px;
      line-height: 50px;
      border: none;

      i {
        font-size: 18px;
      }
    }

    .el-upload-dragger {
      width: 50px;
      height: 50px;
      padding: 0;
      background-color: inherit;
      border-width: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
