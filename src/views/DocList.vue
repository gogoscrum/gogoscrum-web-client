<template>
  <div class="project-docs-page page">
    <div class="filter-row">
      <div class="left-part">
        <el-button
          :disabled="!project.isDeveloper"
          text
          type="primary"
          @click="newDoc"
          icon="CirclePlusFilled"
          class="text-icon-btn"
          >{{ $t('docList.header.new') }}</el-button
        >
      </div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadDocs" class="refresh-btn">
            <Refresh />
          </el-icon>
          <span class="item-count">{{
            filter.keyword
              ? $t('common.filter.matchedResults', { count: totalElements })
              : $t('docList.header.docCount', { count: totalElements })
          }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('docList.header.search')"
            @input="inputChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="docs"
        v-loading="loading"
        row-class-name="doc-row clickable"
        :show-header="true"
        @row-click="docClicked">
        <el-table-column
          :label="$t('docList.list.name')"
          :min-width="isInMobile ? 150 : 200"
          class-name="icon-name-column">
          <template #default="scope">
            <div class="doc-name-container">
              <span
                class="doc-name"
                :data-index="scope.$index"
                v-html="scope.row.nameHighlightLabel || scope.row.name" />
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="!isInMobile" prop="publicAccess" :label="$t('docList.list.publicAccess')" min-width="50">
          <template #default="scope">
            <DocPublicAccessPop v-if="scope.row.publicAccess" :doc="scope.row">
              <template #reference>
                <el-tag type="success" effect="dark" size="small">{{ $t('docList.list.public') }}</el-tag>
              </template>
            </DocPublicAccessPop>
            <span v-else></span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isInMobile"
          prop="createdTimeFormatted"
          :label="$t('docList.list.createdTime')"
          min-width="80">
        </el-table-column>
        <el-table-column v-if="!isInMobile" :label="$t('docList.list.creator')" min-width="50">
          <template #default="scope">
            <avatar
              :name="scope.row.createdBy.nickname"
              :size="22"
              :src="scope.row.createdBy.avatarUrl"
              showName></avatar>
          </template>
        </el-table-column>

        <el-table-column v-if="project.isDeveloper" :label="$t('common.actions')" width="80" align="center">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="Edit" @click.native="editDoc(scope.row)">{{
                    $t('common.edit')
                  }}</el-dropdown-item>
                  <el-dropdown-item icon="Delete" @click.native="deleteDoc(scope.$index, scope.row)">{{
                    $t('common.delete')
                  }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template v-slot:empty>
          <el-empty :image-size="100" :description="$t('docList.list.noDocInProject')">
            <el-button type="primary" icon="Plus" size="default" @click="newDoc">{{
              $t('docList.header.new')
            }}</el-button>
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
    </div>
  </div>
</template>

<script>
import Avatar from '@/components/common/Avatar.vue'
import DocPublicAccessPop from '@/components/doc/DocPublicAccessPop.vue'
import { docApi } from '@/api/doc.js'
import highlight from '@/utils/highlight.js'
import utils from '@/utils/util.js'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'DocList',
  components: {
    Avatar,
    DocPublicAccessPop
  },
  data() {
    return {
      isInMobile: utils.isInMobile(),
      projectId: null,
      project: {},
      docs: [],
      filter: {
        projectId: null,
        keyword: null,
        page: 1,
        pageSize: this.$store.get('docListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: false
    }
  },
  created() {
    this.projectId = this.$route.params.projectId
    this.filter.projectId = this.projectId
    this.project = this.$store.get('project')
  },
  mounted() {
    this.loadDocs()
  },
  methods: {
    loadDocs() {
      this.loading = true
      docApi
        .search(this.filter)
        .then((res) => {
          let results = highlight.highlight(res.data.results, this.filter.keyword, 'name')
          results.forEach((doc) => this.formatDoc(doc))
          this.docs = results
          this.totalElements = res.data.totalElements
          this.totalPages = res.data.totalPages
        })
        .finally(() => {
          setTimeout(() => {
            this.loading = false
          }, 200)
        })
    },
    formatDoc(doc) {
      return utils.formatCreateUpdateTime(doc)
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
      this.filter.page = 1
      this.loadDocs()
    },
    pageChanged: function (page) {
      this.filter.page = page
      this.loadDocs()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.filter.page = 1
      this.$store.set('docListPageSize', this.filter.pageSize)
      this.loadDocs()
    },
    newDoc() {
      this.$router.push({ name: 'DocDetails', params: { docId: 'new' } })
    },
    editDoc(row) {
      this.$router.push({
        name: 'DocDetails',
        params: { docId: row.id },
        query: { type: 'edit' }
      })
    },
    docClicked(row) {
      this.$router.push({ name: 'DocDetails', params: { docId: row.id } })
    },
    deleteDoc(index, row) {
      ElMessageBox.confirm(
        this.$t('docList.msg.delConfirmMsg', { name: row.name }),
        this.$t('docList.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          docApi.delete(row.id).then((response) => {
            this.docs.splice(index, 1)
            this.totalElements--
            ElMessage.success({
              message: this.$t('docList.msg.delSuccess')
            })
          })
        })
        .catch(() => {
          // Cancelled, do nothing
        })
    }
  }
}
</script>

<style lang="less" scoped>
.project-docs-page {
}
</style>
