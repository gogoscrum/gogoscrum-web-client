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
          <column-selector
            v-model="columns"
            :available-columns="availableColumns"
            store-key="tagListColumns"></column-selector>
          <span class="item-count">{{
            filter.keyword
              ? $t('common.filter.matchedResults', { count: totalElements })
              : $t('tagList.header.tagCount', { count: totalElements })
          }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.keyword"
            clearable
            prefix-icon="Search"
            :placeholder="$t('tagList.header.search')"
            @input="inputChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="tags"
        v-loading="loading"
        class="tag-list"
        row-class-name="tag-row"
        :show-header="true"
        @filterChange="filterChange"
        @sort-change="sortChange"
        @row-click="editTag"
        empty-text="No data">
        <el-table-column
          prop="name"
          :label="$t('tagList.list.name')"
          sortable="custom"
          :min-width="isInMobile ? 120 : 300"
          class-name="clickable">
          <template #default="scope">
            <el-tag :color="scope.row.color || '#999999'" effect="dark" class="no-border">{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('creator') && !isInMobile"
          :label="$t('tagList.list.creator')"
          prop="createdBy.nickname"
          sortable="custom"
          column-key="creators"
          :filters="userFilters"
          :filter-multiple="true"
          min-width="120">
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
          prop="createdTime"
          :label="$t('common.createdTime')"
          sortable="custom"
          min-width="150">
          <template #default="scope">
            {{ scope.row.createdTimeFormatted }}
          </template>
        </el-table-column>
        <!-- <el-table-column
          v-if="columns.includes('updatedTime') && !isInMobile"
          prop="updatedTime"
          :label="$t('common.updatedTime')"
          sortable="custom"
          min-width="150">
          <template #default="scope">
            {{ scope.row.updatedTimeFormatted }}
          </template>
        </el-table-column> -->
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
                  <el-dropdown-item icon="Edit" @click="editTag(scope.row)">{{ $t('common.edit') }}</el-dropdown-item>
                  <el-dropdown-item
                    icon="Delete"
                    :disabled="scope.row.backlog"
                    @click="deleteTag(scope.$index, scope.row)">
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
import ColumnSelector from '@/components/common/ColumnSelector.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'TagList',
  components: {
    TagEdit,
    Avatar,
    ColumnSelector
  },
  data() {
    const availableColumns = [
      { key: 'name', labelKey: 'tagList.list.name', default: true, readonly: true },
      { key: 'creator', labelKey: 'tagList.list.creator', default: true },
      { key: 'createdTime', labelKey: 'common.createdTime', default: true },
      { key: 'actions', labelKey: 'common.actions', default: true, readonly: true }
    ]
    const defaultColumns = availableColumns.filter((column) => column.default).map((column) => column.key)

    return {
      project: {},
      isInMobile: utils.isInMobile(),
      tags: [],
      filter: {
        projectId: null,
        keyword: null,
        orders: [],
        page: 1,
        pageSize: this.$store.get('tagListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: true,
      editingTag: null,
      userFilters: [],
      columns: this.$store.get('tagListColumns') || defaultColumns,
      availableColumns
    }
  },
  created() {
    this.filter.projectId = this.$route.params.projectId
    this.project = this.$store.get('project')
    this.initColumnFilters()
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
    initColumnFilters() {
      this.userFilters = (this.project.projectMembers || []).map((member) => ({
        text: member.user.nickname,
        value: member.user.id
      }))
    },
    formatTag(tag) {
      return utils.formatCreateUpdateTime(tag)
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
      this.filterChanged()
    },
    sortChange(event) {
      this.filter.orders = utils.getSortOrders(event) || []
      this.filterChanged()
    },
    filterChange(filters) {
      if (filters.creators) {
        if (filters.creators.length > 0) {
          this.filter.creators = filters.creators
        } else {
          this.filter.creators = null
        }
      }
      this.filterChanged()
    },
    filterChanged() {
      this.filter.page = 1
      this.loadTags()
    },
    pageChanged: function (page) {
      this.filter.page = page
      this.loadTags()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.$store.set('tagListPageSize', this.filter.pageSize)
      this.filterChanged()
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
