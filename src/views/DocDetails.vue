<template>
  <div ref="docDetailsPage" :class="`project-doc-content page ${inFullscreen ? 'fullscreen' : ''}`">
    <div v-if="!editing" class="filter-row">
      <div class="left-part">
        <el-button text type="primary" @click="goBack" icon="ArrowLeft" class="text-icon-btn">
          {{ $t('docView.header.back') }}
        </el-button>
        <el-button
          text
          type="primary"
          :disabled="!project.isDeveloper"
          @click="editDoc"
          icon="Edit"
          class="text-icon-btn">
          {{ $t('docView.header.edit') }}
        </el-button>
      </div>
      <span v-if="doc.updatedBy" class="desc ml-32px">
        {{
          $t('docView.header.lastEdit', {
            updatedBy: doc.updatedBy.nickname,
            updatedTime: doc.updatedTimeFormatted
          })
        }}
      </span>
      <div class="flex items-center right-part">
        <DocPublicAccessPop :doc="doc">
          <template #reference>
            <el-switch
              v-model="doc.publicAccess"
              size="small"
              :active-text="$t('docView.msg.allowPublicAccess')"
              @change="updatePublicAccess" />
          </template>
        </DocPublicAccessPop>

        <!-- <el-popover :content="$t('docView.msg.publicAccessTip')" placement="top">
          <template #reference>
            <el-switch
              v-model="doc.publicAccess"
              size="small"
              :active-text="$t('docView.msg.allowPublicAccess')"
              @change="updatePublicAccess" />
          </template>
          
        </el-popover> -->
      </div>
    </div>
    <div class="main">
      <div v-if="editing">
        <el-input
          ref="docTitleInput"
          v-model="doc.name"
          class="title-input"
          :placeholder="$t('docView.titlePlaceholder')"
          :maxlength="128" />
        <tinymce ref="editor" v-model="doc.content" :menubar="false" :height="520" :dark="dark" />
      </div>
      <div v-else>
        <div class="title">
          <span>{{ doc.name }}</span>
        </div>
        <div v-html="doc.content"></div>
      </div>
    </div>
    <div v-if="editing" class="footer">
      <el-button type="primary" text @click="toggleFullscreen">
        <template #icon>
          <span :class="`iconfont ${inFullscreen ? 'icon-full-screen-cancel' : 'icon-full-screen'}`" />
        </template>
        {{ inFullscreen ? $t('docView.exitFullScreen') : $t('docView.intoFullScreen') }}</el-button
      >
      <div class="flex items-center">
        <span class="desc mr-6">{{ lastSavedTip }}</span>
        <el-button v-if="!inFullscreen" @click="goBack">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" :disabled="!docModified" @click="saveDoc">{{
          $t('common.save')
        }}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { docApi } from '@/api/doc.js'
import Tinymce from '@/components/common/Tinymce.vue'
import { ElNotification } from 'element-plus'
import utils from '@/utils/util'
import DocPublicAccessPop from '@/components/doc/DocPublicAccessPop.vue'

export default {
  name: 'DocDetails',
  components: {
    Tinymce,
    DocPublicAccessPop
  },
  data() {
    return {
      project: {},
      editing: false,
      doc: {
        projectId: this.$route.params.projectId,
        name: '',
        content: ''
      },
      originDoc: {
        name: '',
        content: ''
      },
      saving: false,
      inFullscreen: false,
      lastSavedTip: '',
      dark: this.$store.get('darkMode') || false
    }
  },
  computed: {
    docModified() {
      return this.originDoc.name != this.doc.name || this.originDoc.content != this.doc.content
    }
  },
  created() {
    const docId = this.$route.params.docId
    this.editing = docId === 'new' || this.$route.query.type === 'edit'
    if (docId !== 'new') {
      this.getDoc(docId)
    }
  },
  mounted() {
    this.project = this.$store.get('project')

    if (this.editing) {
      this.$refs.docTitleInput.focus()
      this.autoSave()

      if (document.addEventListener) {
        document.addEventListener('fullscreenchange', this.quitFullscreen)
        document.addEventListener('mozfullscreenchange', this.quitFullscreen)
        document.addEventListener('MSFullscreenChange', this.quitFullscreen)
        document.addEventListener('webkitfullscreenchange', this.quitFullscreen)
      }
    }
  },
  watch: {
    '$route.query.type': {
      handler(type) {
        const docId = this.$route.params.docId
        this.editing = docId === 'new' || this.$route.query.type === 'edit'
        if (docId !== 'new') {
          this.getDoc(docId)
        }
      }
    }
  },
  methods: {
    getDoc(id) {
      if (id && id > 0) {
        docApi.getById(id).then((res) => {
          this.doc = this.formatDoc(res.data)
          this.backup()
        })
      }
    },
    formatDoc(doc) {
      return utils.formatCreateUpdateTime(doc)
    },
    autoSave() {
      setInterval(() => {
        if (this.docModified) {
          this.saveDoc()
        }
      }, 30 * 1000)
    },
    backup() {
      this.originDoc.name = this.doc.name
      this.originDoc.content = this.doc.content
    },
    editDoc() {
      this.$router.push({
        name: 'DocDetails',
        params: { docId: this.doc.id },
        query: { type: 'edit' }
      })
    },
    toggleFullscreen() {
      utils.toggleFullscreen(this.$refs.docDetailsPage)
      this.inFullscreen = !this.inFullscreen
    },
    quitFullscreen() {
      if (!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement) {
        this.inFullscreen = false
      }
    },
    updatePublicAccess() {
      const apiCall = this.doc.publicAccess ? docApi.setPublicAccess : docApi.deletePublicAccess
      apiCall(this.doc.id).then((res) => {
        this.doc = this.formatDoc(res.data)
        this.$message.success(
          this.doc.publicAccess
            ? this.$t('docView.msg.publicAccessEnabled')
            : this.$t('docView.msg.publicAccessDisabled')
        )
      })
    },
    saveDoc() {
      if (!this.doc.name) {
        this.doc.name = this.$t('docView.defaultTitle')
      }
      this.saving = true
      docApi
        .save(this.doc)
        .then((res) => {
          this.doc = this.formatDoc(res.data)
          this.backup()
          ElNotification.success({
            message: this.$t('docView.docSaved'),
            position: 'bottom-left',
            duration: 3000,
            appendTo: this.$refs.docDetailsPage
          })
          this.lastSavedTip = this.$t('docView.lastSavedTip', { updatedTime: this.doc.updatedTimeFormatted })
        })
        .finally(() => {
          setTimeout(() => {
            this.saving = false
          }, 300)
        })
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="less" scoped>
.project-doc-content {
  display: flex;
  flex-direction: column;
  word-break: break-word;

  &.fullscreen {
    background-color: var(--el-bg-color);
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 32px;
    margin: 10px 0 20px 0;
  }
  .main {
    .title {
      height: auto;
      outline: 0;
      resize: none;
      width: 100%;
      font-size: 28px;
      font-weight: 700;
      text-align: center;
      margin-bottom: 10px;
      padding-bottom: 5px;
    }
    :deep(.el-input__inner) {
      .title();
    }
  }
  .footer {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }
}
</style>

<style lang="less">
.project-doc-content {
  .title-input {
    --el-color-primary: transparent;
    --el-border-color: transparent;
    --el-border-color-hover: transparent;
  }

  &.fullscreen {
    .tox-tinymce {
      height: calc(100vh - 200px) !important;
      min-height: 150px;
    }
  }
}
</style>
