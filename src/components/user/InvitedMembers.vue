<template>
  <div class="edit-tag-container">
    <el-dialog
      :title="$t('invitedMemberList.title')"
      v-model="dialogVisible"
      :fullscreen="isInMobile"
      :draggable="true"
      @close="$emit('close')"
      width="720px">
      <el-table
        v-if="members?.length"
        :data="members"
        class="member-list"
        row-class-name="member-row"
        :show-header="true">
        <el-table-column prop="user.nickname" :label="$t('invitedMemberList.header.name')" min-width="80">
          <template #default="scope">
            <div class="flex items-center">
              <avatar
                :name="scope.row.user.nickname"
                :size="22"
                :src="scope.row.user.avatarUrl"
                inline
                class="mr-2"></avatar>
              <span>{{ scope.row.user.nickname }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="role" :label="$t('invitedMemberList.header.role')" min-width="50">
          <template #default="scope">
            {{ $t(`projectMemberRoles.${scope.row.role}`) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdTimeFormatted" :label="$t('invitedMemberList.header.joinedTime')" min-width="80">
        </el-table-column>
        <el-table-column
          v-if="!isInMobile"
          prop="user.createdTimeFormatted"
          :label="$t('invitedMemberList.header.registeredTime')"
          min-width="80">
        </el-table-column>
      </el-table>
      <div class="table-footer">
        <el-pagination
          :current-page="page"
          :page-count="totalPages"
          size="small"
          hide-on-single-page
          background
          layout="prev, pager, next"
          @current-change="pageChanged">
        </el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { projectApi } from '@/api/project.js'
import utils from '@/utils/util.js'
import Avatar from '@/components/common/Avatar.vue'

export default {
  components: {
    Avatar
  },
  props: {
    projectId: {
      type: String,
      default: null
    },
    invitationId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      dialogVisible: true,
      isInMobile: utils.isInMobile(),
      members: null,
      page: 1,
      pageSize: 5,
      totalElements: 0,
      totalPages: 0
    }
  },
  created() {},
  mounted() {
    this.loadMembers()
  },
  methods: {
    loadMembers() {
      projectApi.findMembersByInvitation(this.projectId, this.invitationId, this.page, this.pageSize).then((res) => {
        this.members = res.data.results
        this.members.forEach((member) => {
          utils.formatCreateUpdateTime(member)
          utils.formatCreateUpdateTime(member.user)
        })
        this.totalElements = res.data.totalElements
        this.totalPages = res.data.totalPages
        this.page = res.data.currentPage
      })
    },
    pageChanged: function (page) {
      this.page = page
      this.loadMembers()
    }
  }
}
</script>

<style lang="less"></style>
