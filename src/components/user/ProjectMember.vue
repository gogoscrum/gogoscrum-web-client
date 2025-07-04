<template>
  <div class="user-add-container">
    <el-drawer
      ref="memberDrawer"
      :title="$t('projectMember.title')"
      v-model="userDrawerVisible"
      size="350px"
      @open="init"
      @close="$emit('onDrawerClosed')">
      <div class="project-members-drawer-content">
        <el-button
          class="inviteButton"
          type="primary"
          size="large"
          @click="showUserPicker"
          :disabled="!isOwner"
          :title="$t('projectMember.onlyOwnerCanInvite')">
          {{ project ? $t('projectMember.invite') : $t('projectMember.noProjectSelected') }}
        </el-button>
        <el-table
          class="user-table"
          :data="selectedUserList"
          width="100%"
          :show-header="false"
          row-class-name="project-member-row">
          <el-table-column min-width="35" class-name="avatar-column">
            <template #default="scope">
              <avatar :name="scope.row.user.nickname" :src="scope.row.user.avatarUrl" :size="30" inline></avatar>
            </template>
          </el-table-column>
          <el-table-column min-width="120">
            <template #default="scope">
              {{ scope.row.user.nickname }}
            </template>
          </el-table-column>
          <el-table-column min-width="30">
            <template #default="scope">
              <template v-if="scope.row.role == 'OWNER'">
                <el-tooltip :content="$t('projectMember.owner')" placement="left">
                  <i class="iconfont icon-huangguan owner-icon" />
                </el-tooltip>
              </template>
              <template v-else-if="scope.row.role == 'DEVELOPER'">
                <el-tooltip :content="$t('projectMember.developer')" placement="left">
                  <el-icon><UserFilled /></el-icon>
                </el-tooltip>
              </template>
              <template v-else>
                <el-tooltip :content="$t('projectMember.guest')" placement="left">
                  <el-icon><User /></el-icon>
                </el-tooltip>
              </template>
            </template>
          </el-table-column>
          <el-table-column min-width="35">
            <template #default="scope">
              <template v-if="scope.row.role != 'OWNER' && isOwner">
                <el-dropdown trigger="click">
                  <div class="more-action-icon">
                    <el-icon><MoreFilled /></el-icon>
                  </div>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item
                        v-if="scope.row.role == 'DEVELOPER'"
                        icon="User"
                        @click.native="setAsGuest(scope.$index, scope.row)">
                        {{ $t('projectMember.setAsGuest') }}
                      </el-dropdown-item>
                      <el-dropdown-item
                        v-else
                        icon="UserFilled"
                        @click.native="setAsDeveloper(scope.$index, scope.row)">
                        {{ $t('projectMember.setAsDeveloper') }}
                      </el-dropdown-item>
                      <el-dropdown-item icon="Delete" @click.native="removeMember(scope.$index)">
                        {{ $t('projectMember.remove') }}
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!isOwner" class="quit-project-row">
          <el-button type="danger" plain size="large" @click="quitProject">{{
            $t('projectMember.quitProject')
          }}</el-button>
        </div>
      </div>
    </el-drawer>
    <user-picker
      v-if="userPickerVisible"
      :project="project"
      :originalSelectedUserIds="selectedUserIdList"
      :projectOwnerId="project.owner.id"
      @pickedUser="pickedUser"
      @unpickedUser="unpickedUser"
      @userPickerClosed="userPickerClosed" />
  </div>
</template>
<script>
import { projectApi } from '@/api/project.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import UserPicker from '@/components/user/UserPicker.vue'
import Avatar from '@/components/common/Avatar.vue'
export default {
  components: {
    Avatar,
    UserPicker
  },
  data() {
    return {
      userDrawerVisible: this.originalUserDrawerVisible,
      userPickerVisible: false,
      selectedUserList: [],
      selectedUserIdList: [],
      currentUser: this.$store.get('user'),
      isOwner: false,
      localProject: null
    }
  },
  props: {
    project: {
      type: Object,
      default: () => {
        return null
      }
    },
    originalUserDrawerVisible: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    originalUserDrawerVisible(newValue) {
      this.userDrawerVisible = newValue
    },
    project(newValue) {
      this.localProject = newValue
      if (newValue?.projectMembers) {
        let projectMember = newValue.projectMembers.find((member) => member.user.id == this.currentUser.id)

        if (projectMember.role == 'OWNER') {
          this.isOwner = true
        } else {
          this.isOwner = false
        }
        this.init()
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      this.localProject = this.project
      if (this.localProject !== null && this.localProject.projectMembers) {
        this.selectedUserList = this.localProject.projectMembers
        for (let i = 0; i < this.selectedUserList.length; i++) {
          if (this.selectedUserList[i].role == 'OWNER') {
            let owner = this.selectedUserList.splice(i, 1)[0]
            this.selectedUserList.splice(0, 0, owner)
          }
        }
        this.initSelectedUserIds()
      }
    },
    initSelectedUserIds() {
      this.selectedUserIdList = []
      this.selectedUserList.forEach((projectMember) => {
        this.selectedUserIdList.push(projectMember.user.id)
      })
    },
    pickedUser(user) {
      let projectMember = {
        user: user,
        project: this.localProject,
        role: 'DEVELOPER'
      }
      this.addMembers(projectMember)
    },
    unpickedUser(user) {
      let index = this.selectedUserList.findIndex((item) => item.user.id == user.id)

      if (index >= 0) {
        this.removeMember(index, 1)
      }
    },
    showUserPicker() {
      this.userPickerVisible = true
    },
    removeMember(index) {
      let removedMember = this.selectedUserList[index]
      projectApi.deleteMember(this.localProject.id, removedMember.id).then((res) => {
        this.selectedUserList.splice(index, 1)
        this.initSelectedUserIds()
      })
    },
    quitProject() {
      let currentMember = this.selectedUserList.find((member) => member.user.id === this.currentUser.id)

      if (currentMember) {
        ElMessageBox.confirm(
          this.$t('projectMember.quitConfirmMsg', {
            projectName: this.localProject.name
          }),
          this.$t('projectMember.quitConfirmTitle'),
          {
            type: 'warning',
            draggable: true
          }
        ).then(() => {
          projectApi.deleteMember(this.localProject.id, currentMember.id).then((res) => {
            ElMessage.success({
              message: this.$t('projectMember.quitSuccess', {
                projectName: this.localProject.name
              })
            })
            this.$refs.memberDrawer.handleClose()
            this.$router.push({ name: 'MyProjects' })
          })
        })
      }
    },
    userPickerClosed() {
      this.userPickerVisible = false
    },
    addMembers(projectMember) {
      projectApi.createMember(this.localProject.id, projectMember).then((res) => {
        this.selectedUserList.push(res.data)
      })
    },
    setAsGuest(index, row) {
      projectApi.setAsGuest(this.project.id, row.id).then((res) => {
        this.selectedUserList.splice(index, 1, res.data)
        this.$bus.$emit('projectMemberUpdate', this.selectedUserList)
      })
    },
    setAsDeveloper(index, row) {
      projectApi.setAsDeveloper(this.project.id, row.id).then((res) => {
        this.selectedUserList.splice(index, 1, res.data)
        this.$bus.$emit('projectMemberUpdate', this.selectedUserList)
      })
    }
  }
}
</script>

<style lang="less" scoped>
.project-members-drawer-content {
  min-height: 100%;
  display: flex;
  flex-direction: column;

  .quit-project-row {
    margin-bottom: 10px;
    text-align: center;

    button {
      width: 95%;
    }
  }
}
</style>

<style lang="less">
.user-add-container {
  .el-drawer__body {
    margin-left: 2.5%;
    margin-right: 2.5%;
    padding: 0;
  }
  .el-input {
    width: 100%;
    position: relative;
  }
  .inviteButton {
    width: 95%;
    margin-left: 2.5%;
  }
  .user-table {
    margin-top: 20px;
    font-size: 15px;
    flex-grow: 1;
    .avatar-column {
      .cell {
        display: flex;
      }
    }
    .avatar {
      margin-left: 10px;
    }
  }
  .el-table__row > td {
    border: none;
  }
  .el-table th.is-leaf {
    border: none;
  }
  .el-table::before {
    height: 0px;
  }

  .project-member-row {
    .more-action-icon {
      font-size: 16px;
      visibility: hidden;
      cursor: pointer;
    }

    &:hover {
      .more-action-icon {
        visibility: visible;
      }
    }
  }
}
</style>
