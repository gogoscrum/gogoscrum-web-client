<template>
  <div class="invitation-list-page page">
    <div class="filter-row">
      <div class="left-part">
        <el-button
          :disabled="!project.isDeveloper"
          text
          type="primary"
          @click="inviteMember"
          class="text-icon-btn"
          icon="CirclePlusFilled"
          >{{ $t('invitationList.header.new') }}</el-button
        >
      </div>
      <div class="right-part">
        <div class="summary-info">
          <el-icon v-if="loading" class="is-loading refresh-btn">
            <Loading />
          </el-icon>
          <el-icon v-else @click="loadInvitations" class="refresh-btn">
            <Refresh />
          </el-icon>
          <column-selector
            v-model="columns"
            :available-columns="availableColumns"
            store-key="invitationListColumns"></column-selector>
          <span class="item-count">{{
            filter.code
              ? $t('common.filter.matchedResults', { count: totalElements })
              : $t('invitationList.header.invitationCount', { count: totalElements })
          }}</span>
        </div>
        <el-form-item class="mb-0!">
          <el-input
            class="search-input"
            v-model="filter.code"
            clearable
            prefix-icon="Search"
            :placeholder="$t('invitationList.header.search')"
            @input="inputChanged"></el-input>
        </el-form-item>
      </div>
    </div>
    <div class="main">
      <el-table
        :data="invitations"
        v-loading="loading"
        class="invitation-list"
        row-class-name="invitation-row"
        :show-header="true"
        @filterChange="filterChange"
        @sort-change="sortChange">
        <el-table-column prop="code" :label="$t('invitationList.list.code')" sortable="custom" min-width="180">
          <template #default="scope">
            <span v-html="scope.row.codeHighlightLabel || scope.row.code"></span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('invitationType') && !isInMobile"
          prop="invitationType"
          :label="$t('invitationList.list.invitationType')"
          sortable="custom"
          column-key="invitationTypes"
          :filters="invitationTypeFilters"
          :filter-multiple="true"
          min-width="100">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.invitationTypes?.length }"
              ><Filter
            /></el-icon>
          </template>
          <template #default="scope">
            <span v-if="scope.row.invitationType">{{ $t(`invitationTypes.${scope.row.invitationType}`) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('status')"
          :label="$t('invitationList.list.status')"
          sortable="custom"
          sort-by="enabled"
          column-key="actives"
          :filters="activeFilters"
          :filter-multiple="false"
          min-width="100">
          <template #filter-icon>
            <el-icon class="table-header-filter-icon" :class="{ active: filter.active !== null }"><Filter /></el-icon>
          </template>
          <template #default="scope">
            <el-tag v-if="!scope.row.enabled" type="info" effect="plain" size="small">{{
              $t('invitationList.list.disabled')
            }}</el-tag>
            <el-tag v-else-if="scope.row.expired" type="info" effect="plain" size="small">{{
              $t('invitationList.list.expired')
            }}</el-tag>
            <el-tag v-else type="success" effect="plain" size="small">{{ $t('invitationList.list.active') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('joinCount') && !isInMobile"
          prop="joinCount"
          :label="$t('invitationList.list.joinCount')"
          sortable="custom"
          min-width="100"
          align="center">
          <template #default="scope">
            <span
              v-if="scope.row.joinCount > 0"
              class="joined-count"
              @click="showJoinedMembers(scope.row)"
              title="Click to view joined members"
              >{{ scope.row.joinCount }}</span
            >
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('creator') && !isInMobile"
          :label="$t('invitationList.list.creator')"
          prop="createdBy.nickname"
          sortable="custom"
          column-key="creators"
          :filters="userFilters"
          :filter-multiple="true"
          min-width="100">
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
          :label="$t('invitationList.list.createdTime')"
          sortable="custom"
          min-width="150">
          <template #default="scope">
            {{ scope.row.createdTimeFormatted }}
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('expireTime') && !isInMobile"
          prop="expireTime"
          :label="$t('invitationList.list.expireTime')"
          sortable="custom"
          min-width="150">
          <template #default="scope">
            <span>{{ scope.row.expireTime || $t('invitationList.list.neverExpire') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="columns.includes('actions') && project.isDeveloper"
          :label="$t('common.actions')"
          width="80"
          class-name="actions-column">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item
                    v-if="scope.row.enabled && !scope.row.expired"
                    icon="CopyDocument"
                    @click="copyInvitationUrl(scope.row)"
                    >{{ $t('invitationList.list.actions.copyUrl') }}</el-dropdown-item
                  >
                  <el-dropdown-item
                    v-if="scope.row.enabled"
                    icon="CircleClose"
                    @click="disableInvitation(scope.$index, scope.row)"
                    >{{ $t('invitationList.list.actions.disable') }}</el-dropdown-item
                  >
                  <el-dropdown-item v-else icon="CircleCheck" @click="enableInvitation(scope.$index, scope.row)">{{
                    $t('invitationList.list.actions.enable')
                  }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
        <template v-slot:empty>
          <el-empty :image-size="100" :description="$t('invitationList.list.noInvitationInProject')">
            <el-button
              :disabled="!project.isDeveloper"
              type="primary"
              icon="Plus"
              size="default"
              @click="inviteMember"
              >{{ $t('invitationList.header.new') }}</el-button
            >
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
      <InvitedMembers
        v-if="invitationId"
        :invitationId="invitationId"
        :projectId="filter.projectId"
        @close="hideJoinedMembers" />
    </div>
  </div>
</template>
<script>
import { invitationApi } from '@/api/invitation.js'
import highlight from '@/utils/highlight.js'
import Avatar from '@/components/common/Avatar.vue'
import dayjs from 'dayjs'
import utils from '@/utils/util.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import InvitedMembers from '@/components/user/InvitedMembers.vue'
import ColumnSelector from '@/components/common/ColumnSelector.vue'

export default {
  data() {
    const availableColumns = [
      { key: 'code', labelKey: 'invitationList.list.code', default: true, readonly: true },
      { key: 'invitationType', labelKey: 'invitationList.list.invitationType', default: true },
      { key: 'status', labelKey: 'invitationList.list.status', default: true, readonly: true },
      { key: 'joinCount', labelKey: 'invitationList.list.joinCount', default: true },
      { key: 'creator', labelKey: 'invitationList.list.creator', default: true },
      { key: 'createdTime', labelKey: 'invitationList.list.createdTime', default: true },
      { key: 'expireTime', labelKey: 'invitationList.list.expireTime', default: true },
      { key: 'actions', labelKey: 'common.actions', default: true, readonly: true }
    ]
    const defaultColumns = availableColumns.filter((column) => column.default).map((column) => column.key)

    return {
      isInMobile: utils.isInMobile(),
      invitations: [],
      filter: {
        projectId: null,
        code: null,
        active: null,
        orders: [],
        page: 1,
        pageSize: this.$store.get('invitationListPageSize') || 10
      },
      totalElements: 0,
      totalPages: 0,
      loading: true,
      project: {},
      invitationId: null,
      userFilters: [],
      invitationTypeFilters: [],
      activeFilters: [],
      columns: this.$store.get('invitationListColumns') || defaultColumns,
      availableColumns
    }
  },
  components: {
    Avatar,
    InvitedMembers,
    ColumnSelector
  },
  name: 'InvitationList',
  created() {
    this.project = this.$store.get('project')
    this.filter.projectId = this.$route.params.projectId
    this.initColumnFilters()
    this.loadInvitations()
  },
  mounted() {},
  methods: {
    initColumnFilters() {
      this.userFilters = (this.project.projectMembers || []).map((member) => ({
        text: member.user.nickname,
        value: member.user.id
      }))
      this.invitationTypeFilters = ['DEVELOPER', 'GUEST'].map((type) => ({
        text: this.$t(`invitationTypes.${type}`),
        value: type
      }))
      this.activeFilters = [
        { text: this.$t('invitationList.header.active'), value: true },
        { text: this.$t('invitationList.header.inactive'), value: false }
      ]
    },
    loadInvitations() {
      this.loading = true

      invitationApi
        .search(this.filter)
        .then((res) => {
          this.invitations = highlight.highlight(res.data.results, this.filter.code, 'code')

          this.invitations.forEach((invitation) => {
            this.formatInvitation(invitation)
          })

          this.totalElements = res.data.totalElements
          this.totalPages = res.data.totalPages
          this.filter.page = res.data.currentPage
        })
        .finally(() => {
          // Delay a little bit to improve user experience
          setTimeout(() => {
            this.loading = false
          }, 200)
        })
    },
    formatInvitation(invitation) {
      utils.formatCreateUpdateTime(invitation)

      if (invitation.expireTime) {
        invitation.expireTime = dayjs(invitation.expireTime).format('YYYY-MM-DD HH:mm:ss')
      }

      if (invitation.expireTime) {
        invitation.expired = dayjs(invitation.expireTime).isBefore(dayjs())
      }
    },
    inviteMember() {
      this.$bus.$emit('openInvitationDialog')
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
        this.filter.creators = filters.creators.length > 0 ? filters.creators : null
      }

      if (filters.invitationTypes) {
        this.filter.invitationTypes = filters.invitationTypes.length > 0 ? filters.invitationTypes : null
      }

      if (filters.actives) {
        this.filter.active = filters.actives.length > 0 ? filters.actives[0] : null
      }

      this.filterChanged()
    },
    filterChanged() {
      this.filter.page = 1
      this.loadInvitations()
    },
    pageChanged: function (page) {
      this.filter.page = page
      this.loadInvitations()
    },
    pageSizeChanged(size) {
      this.filter.pageSize = size
      this.$store.set('invitationListPageSize', this.filter.pageSize)
      this.filterChanged()
    },
    disableInvitation: function (index, row) {
      ElMessageBox.confirm(
        this.$t('invitationList.msg.disableConfirmMsg', { code: row.code }),
        this.$t('invitationList.msg.disableConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          invitationApi.disable(row.projectId, row.id).then((response) => {
            this.formatInvitation(response.data)
            this.invitations.splice(index, 1, response.data)
            ElMessage.success({
              message: this.$t('invitationList.msg.disableSuccess')
            })
          })
        })
        .catch((err) => {
          // Cancelled, do nothing
        })
    },
    enableInvitation: function (index, row) {
      invitationApi.enable(row.projectId, row.id).then((response) => {
        this.formatInvitation(response.data)
        this.invitations.splice(index, 1, response.data)
        ElMessage.success({
          message: this.$t('invitationList.msg.enableSuccess')
        })
      })
    },
    copyInvitationUrl(invitation) {
      let location = window.location
      let baseUrl = location.protocol + '//' + location.host
      let currentUser = this.$store.get('user')
      invitation.url = `${baseUrl}/invitations/${invitation.code}`
      invitation.msg = this.$t('userPicker.msg.invitationMsg', {
        currentUser: currentUser.nickname,
        projectName: this.project.name,
        url: invitation.url
      })
      if (invitation.expireTime) {
        invitation.msg += this.$t('userPicker.msg.expire', {
          expiry: invitation.expireTime
        })
      } else {
        invitation.msg += this.$t('userPicker.msg.neverExpire')
      }

      navigator.clipboard.writeText(invitation.msg)
      ElMessage.success({
        message: this.$t('userPicker.msg.linkCopied')
      })
    },
    showJoinedMembers(row) {
      this.invitationId = row.id
    },
    hideJoinedMembers() {
      this.invitationId = null
    }
  }
}
</script>

<style lang="less" scoped>
.invitation-list-page {
  .invitation-row {
    .joined-count {
      cursor: pointer;
      color: var(--el-color-primary);
      font-weight: 500;
    }
  }
}
</style>
