<template>
  <div class="user-pick-dialog">
    <el-dialog
      :model-value="userPickerVisible"
      width="480px"
      top="8vh"
      :fullscreen="isInMobile"
      :draggable="true"
      class="add-project-member-dialog"
      @close="$emit('userPickerClosed')">
      <div class="add-project-member-container">
        <el-tabs v-model="activeTab" @tab-change="tabChanged">
          <el-tab-pane name="userPickerTab" :label="$t('userPicker.tabSelectUser')">
            <div class="user-picker-container">
              <el-input
                class="user-search-input"
                prefix-icon="Search"
                v-model="searchFilter.keyword"
                :placeholder="$t('userPicker.searchPlaceholder')"
                clearable
                @input="searchUser" />
              <el-scrollbar class="user-list" height="400px" @end-reached="loadMoreUser">
                <div
                  v-for="user in allUserList"
                  :key="user.id"
                  class="user-row"
                  @click="userClicked(user)"
                  @mouseenter="hoverUserId = user.id"
                  @mouseleave="hoverUserId = null">
                  <div class="avatar-and-nickname">
                    <avatar :name="user.nickname" :src="user.avatarUrl" :size="30"></avatar>
                    <span class="nickname">{{ user.nickname }}</span>
                  </div>
                  <div>
                    <span v-if="user.id == hoverUserId">
                      <el-icon class="action-icon">
                        <RemoveFilled v-if="selectedUserIds.includes(user.id)" class="remove-icon" />
                        <CirclePlusFilled v-else class="add-icon" />
                      </el-icon>
                    </span>
                    <el-icon
                      v-else
                      :class="`action-icon ${
                        selectedUserIds.includes(user.id) ? 'user-selected-icon' : 'user-not-selected-icon'
                      }`">
                      <CircleCheck />
                    </el-icon>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </el-tab-pane>
          <el-tab-pane name="shareInvitationTab" class="invitation-tab" :label="$t('userPicker.tabShare')">
            <div>
              <div class="invitation-type mb-2.5">
                <el-radio-group v-model="invitation.invitationType" @change="generateInvitation">
                  <el-radio value="DEVELOPER">{{ $t('userPicker.inviteAsDeveloper') }}</el-radio>
                  <el-radio value="GUEST">{{ $t('userPicker.inviteAsGuest') }}</el-radio>
                </el-radio-group>
              </div>
              <div class="invitation-link-row">
                <el-input v-model="invitation.msg" type="textarea" :autosize="{ minRows: 4 }" resize="none"> </el-input>
                <div class="invitation-option btn-row">
                  <div class="invitation-available">
                    <div class="label">
                      {{ $t('userPicker.invitationValidity') }}
                    </div>
                    <el-select
                      size="small"
                      v-model="invitation.validDays"
                      value-key="value"
                      @change="generateInvitation"
                      class="validity-selector">
                      <el-option
                        v-for="item in validDaysOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </div>
                  <el-button type="primary" @click="copyInvitationUrl">{{ $t('userPicker.copyLink') }}</el-button>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { userApi } from '@/api/user.js'
import { projectApi } from '@/api/project.js'
import utils from '@/utils/util.js'
import Avatar from '@/components/common/Avatar.vue'
import { ElMessage } from 'element-plus'

export default {
  data() {
    return {
      isInMobile: utils.isInMobile(),
      currentUser: {},
      userPickerVisible: true,
      activeTab: 'userPickerTab',
      loading: false,
      invitation: {
        projectId: this.project.id,
        invitationType: 'DEVELOPER',
        validDays: 3
      },
      allUserList: [],
      selectedUserIds: Object.assign([], this.originalSelectedUserIds),
      searchFilter: {
        keyword: null,
        page: 1,
        pageSize: 10
      },
      totalPages: 0,
      hoverUserId: null,
      validDaysOptions: [
        {
          value: 3,
          label: this.$t('userPicker.threeDays')
        },
        {
          value: 7,
          label: this.$t('userPicker.sevenDays')
        },
        {
          value: 30,
          label: this.$t('userPicker.thirtyDays')
        },
        {
          value: 9999,
          label: this.$t('userPicker.neverExpire')
        }
      ]
    }
  },
  components: {
    Avatar
  },
  props: {
    project: {
      type: Object,
      default: () => {
        return null
      }
    },
    originalSelectedUserIds: {
      type: Array,
      default: () => {
        return []
      }
    },
    loadUsersBySelf: {
      type: Boolean,
      default: true
    },
    projectOwnerId: {
      type: String,
      default: () => {
        return null
      }
    }
  },
  created() {
    this.currentUser = this.$store.get('user')
  },
  mounted() {
    this.loadUsers()
  },
  methods: {
    loadUsers() {
      this.loading = true
      userApi.search(this.searchFilter).then((res) => {
        this.totalPages = res.data.totalPages
        this.allUserList = this.allUserList.concat(res.data.results)
        this.loading = false
      })
    },
    searchUser() {
      // throttle searching by 500ms
      clearTimeout(this.searchingTimeout)
      this.searchingTimeout = setTimeout(() => {
        this.searchFilter.page = 1
        this.allUserList = []
        this.loadUsers()
      }, 500)
    },
    loadMoreUser(direction) {
      if (direction === 'bottom' && (this.totalPages === null || this.totalPages > this.searchFilter.page)) {
        this.searchFilter.page = this.searchFilter.page + 1
        this.loadUsers()
      }
    },
    userClicked(user) {
      if (user.id === this.projectOwnerId) {
        ElMessage.warning({
          message: this.$t('userPicker.msg.cannotRemoveOwner')
        })
      } else {
        let checked = false
        if (!this.selectedUserIds.includes(user.id)) {
          checked = true
        }
        this.toggleUser(checked, user)
      }
    },
    toggleUser(checked, user) {
      if (checked) {
        this.selectedUserIds.push(user.id)
        this.$emit('pickedUser', user)
      } else {
        let index = this.selectedUserIds.indexOf(user.id)
        if (index >= 0) {
          this.selectedUserIds.splice(index, 1)
        }
        this.$emit('unpickedUser', user)
      }
    },
    tabChanged() {
      if (this.activeTab === 'shareInvitationTab' && !this.invitation.code) {
        this.generateInvitation()
      }
    },
    generateInvitation() {
      let apiMethod = null

      if (this.invitation.id) {
        apiMethod = projectApi.updateInvitation
      } else {
        apiMethod = projectApi.createInvitation
      }

      apiMethod(this.invitation).then((res) => {
        this.invitation = res.data

        let location = window.location
        let baseUrl = location.protocol + '//' + location.host
        this.invitation.url = `${baseUrl}/invitations/${this.invitation.code}`
        this.invitation.msg = this.$t('userPicker.msg.invitationMsg', {
          currentUser: this.currentUser.nickname,
          projectName: this.project.name,
          url: this.invitation.url
        })
        if (this.invitation.expireTime) {
          this.invitation.msg += this.$t('userPicker.msg.expire', {
            expiry: this.invitation.expireTime
          })
        } else {
          this.invitation.msg += this.$t('userPicker.msg.neverExpire')
        }
      })
    },
    copyInvitationUrl() {
      navigator.clipboard.writeText(this.invitation.msg)
      ElMessage.success({
        message: this.$t('userPicker.msg.linkCopied')
      })
    }
  }
}
</script>

<style lang="less">
.add-project-member-dialog {
  min-height: 300px;

  .el-tabs__header {
    margin: 0 0 30px;
  }
  .el-dialog__body {
    padding: 10px 20px;
  }
}
</style>

<style lang="less" scoped>
.add-project-member-container {
  .invitation-tab {
    .invitation-option {
      width: 100%;
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;

      .invitation-type {
        display: flex;
        align-items: center;
      }
      .invitation-available {
        display: flex;
        align-items: center;
        .validity-selector {
          margin-left: 10px;
          width: 150px;
        }
      }
    }
    .invitation-link-row {
      .btn-row {
        display: flex;
        margin-top: 20px;
      }
    }
  }
}

.user-picker-container {
  .user-search-input {
    width: 100%;
  }

  .user-list {
    margin-top: 20px;
    overflow: scroll;

    .user-row {
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &:hover {
        background-color: #f5f7fa;
        cursor: pointer;
      }

      .avatar-and-nickname {
        display: flex;
        align-items: center;

        .nickname {
          margin-left: 20px;
        }
      }

      .action-icon {
        font-size: 20px;

        .remove-icon {
          color: #eb2d2d;
        }

        .add-icon {
          color: var(--el-color-primary);
        }

        &.user-selected-icon {
          color: var(--el-color-primary);
        }

        &.user-not-selected-icon {
          color: #dcdfe6;
        }
      }

      // .el-icon-circle-check {

      // }
    }
  }
}
</style>
