<template>
  <div class="tag-list-page page">
    <div class="filter-row">
      <div class="left-part">
        <el-button
          :disabled="!project.isDeveloper"
          text
          type="primary"
          @click="newTag"
          class="text-icon-btn"
          icon="CirclePlusFilled"
          >{{ $t('tagList.header.new') }}</el-button
        >
      </div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadTags" class="refresh-btn">
            <Refresh />
          </el-icon>
          <span class="item-count">{{ $t('tagList.header.tagCount', { count: totalElements }) }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('tagList.header.search')"
            @input="keywordChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="tags"
        v-loading="loading"
        class="tag-list"
        row-class-name="tag-row"
        :show-header="false"
        @row-click="editTag"
        empty-text="No data">
        <el-table-column
          prop="name"
          :label="$t('tagList.list.name')"
          :min-width="isInMobile ? 120 : 250"
          class-name="clickable">
          <template #default="scope">
            <el-tag :color="scope.row.color || '#999999'" effect="dark" class="no-border">{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="!isInMobile" :label="$t('tagList.list.creator')" min-width="50">
          <template #default="scope">
            <el-tooltip
              v-if="scope.row.createdBy"
              :content="
                $t('tagList.list.creatorTip', {
                  nickname: scope.row.createdBy.nickname
                })
              "
              placement="left">
              <avatar :name="scope.row.createdBy.nickname" :size="22" :src="scope.row.createdBy.avatarUrl"></avatar>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column
          v-if="!isInMobile"
          prop="updatedTimeFormatted"
          :label="$t('tagList.list.updatedTime')"
          min-width="80">
        </el-table-column>
        <el-table-column
          v-if="project.isDeveloper"
          :label="$t('common.actions')"
          width="50"
          class-name="actions-column">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="Edit" @click.native="editTag(scope.row)">{{
                    $t('common.edit')
                  }}</el-dropdown-item>
                  <el-dropdown-item
                    icon="Delete"
                    :disabled="scope.row.backlog"
                    @click.native="deleteTag(scope.$index, scope.row)">
                    {{ $t('common.delete') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template v-slot:empty>
          <el-empty :image-size="100" :description="$t('tagList.list.noTagInProject')">
            <el-button :disabled="!project.isDeveloper" type="primary" icon="Plus" size="default" @click="newTag">{{
              $t('tagList.header.new')
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
      <tag-edit
        v-if="editingTag"
        :tagId="editingTag.id"
        :projectId="filter.projectId"
        @tagFormClosed="tagDialogClosed"
        @tagSaved="tagSaved" />
    </div>
  </div>
</template>

<script>
import { tagApi } from '@/api/tag.js'
import utils from '@/utils/util.js'
import TagEdit from '@/components/tag/TagEdit.vue'
import Avatar from '@/components/common/Avatar.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'TagList',
  components: {
    TagEdit,
    Avatar
  },
  data() {
    return {
      project: {},
      isInMobile: utils.isInMobile(),
      tags: [],
      filter: {
        projectId: null,
        keyword: null,
        page: 1,
        pageSize: this.$store.get('tagListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: true,
      editingTag: null
    }
  },
  created() {
    this.filter.projectId = this.$route.params.projectId
    this.project = this.$store.get('project')
    this.loadTags()
  },
  mounted() {},
  methods: {
    loadTags() {
      this.loading = true

      tagApi.search(this.filter).then((res) => {
        this.tags = res.data.results.map((tag) => this.formatTag(tag))
        this.totalElements = res.data.totalElements
        this.totalPages = res.data.totalPages
        this.filter.page = res.data.currentPage

        setTimeout(() => {
          this.loading = false
        }, 200)
      })
    },
    formatTag(tag) {
      return utils.formatCreateUpdateTime(tag)
    },
    keywordChanged() {
      this.filter.page = 1
      this.loadTags()
    },
    pageChanged: function (page) {
      this.filter.page = page
      this.loadTags()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.filter.page = 1
      this.$store.set('tagListPageSize', this.filter.pageSize)
      this.loadTags()
    },
    newTag() {
      this.editingTag = {}
    },
    editTag(row) {
      this.editingTag = row
    },
    tagDialogClosed() {
      this.editingTag = null
    },
    tagSaved(tag) {
      this.formatTag(tag)
      let index = utils.indexInArray(this.tags, tag.id)

      if (index >= 0) {
        this.tags.splice(index, 1, tag)
      } else {
        this.tags.unshift(tag)
      }
    },
    tagDeleted(tag) {
      let index = utils.indexInArray(this.tags, tag.id)

      if (index >= 0) {
        this.tags.splice(index, 1)
        this.totalElements--
      }
    },
    deleteTag: function (index, row) {
      ElMessageBox.confirm(
        this.$t('tagList.msg.delConfirmMsg', { name: row.name }),
        this.$t('tagList.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          tagApi.delete(row.id).then((response) => {
            this.tags.splice(index, 1)
            this.totalElements--
            ElMessage.success({
              message: this.$t('tagList.msg.delSuccess')
            })
          })
        })
        .catch((err) => {
          // Cancelled, do nothing
        })
    }
  }
}
</script>

<style lang="less" scoped>
.tag-list-page {
}
</style>
