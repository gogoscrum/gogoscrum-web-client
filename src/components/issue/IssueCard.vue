<template>
  <div class="issue-card-outter-container" :class="{ mini: issue?.miniMode }" @mouseenter="checkPermission">
    <el-dropdown
      v-if="editable"
      size="default"
      trigger="click"
      placement="bottom-start"
      popper-class="issue-card-pop-menu"
      @command="handleCommand"
      class="more-actions-icon">
      <el-icon class="more-icon"><MoreFilled /></el-icon>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item icon="DocumentCopy" command="clone">{{ $t('common.copy') }}</el-dropdown-item>
          <el-dropdown-item icon="Delete" command="delete">{{ $t('common.delete') }}</el-dropdown-item>
          <el-dropdown-item :icon="issue.miniMode ? 'FolderOpened' : 'Folder'" @click.native="toggleMiniMode">{{
            issue.miniMode ? $t('common.expand') : $t('common.collapse')
          }}</el-dropdown-item>
          <el-dropdown-item divided>
            <el-dropdown placement="right-start">
              <span class="submenu-row">
                <div class="flex">
                  <el-icon><User /></el-icon>{{ $t('issueCard.assignee') }}
                </div>
                <el-icon class="suffix-icon"><CaretRight /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu class="assignee-candidates">
                  <div v-show="issue.owner">
                    <el-dropdown-item icon="Close" @click.native="unassign">
                      <span class="assgin-to-me">{{ $t('issueCard.unassign') }}</span>
                    </el-dropdown-item>
                  </div>
                  <div v-show="!issue.owner">
                    <el-dropdown-item icon="Check" @click.native="assignIssueToUser(currentUser)">
                      <span class="assgin-to-me">{{ $t('issueCard.assignToMe') }}</span>
                    </el-dropdown-item>
                  </div>
                  <el-dropdown-item
                    v-for="(member, index) in projectMembers"
                    :divided="index === 0"
                    :key="member.id"
                    :disabled="issue.owner && member.user.id == issue.owner.id"
                    @click.native="assignIssueToUser(member.user)">
                    <div class="user-select-option">
                      <div class="user-avatar flex">
                        <avatar :name="member.user.nickname" :size="20" inline :src="member.user.avatarUrl"></avatar>
                      </div>
                      <div class="username">{{ member.user.nickname }}</div>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-dropdown-item>
          <el-dropdown-item>
            <el-dropdown placement="right-start">
              <span class="submenu-row">
                <div class="flex">
                  <el-icon class="right-icon"><Right /></el-icon>{{ $t('issueCard.move') }}
                </div>
                <el-icon class="suffix-icon"><CaretRight /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu class="sprint-candidates">
                  <el-dropdown-item
                    v-for="targetSprint in project.sprints"
                    :key="targetSprint.id"
                    :disabled="issue.sprint && targetSprint.id == issue.sprint.id"
                    @click.native="moveIssue(targetSprint)">
                    {{ targetSprint.name }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-card :class="`issue-card ${issue.type}`">
      <div class="issue-card-body" @click="editIssue">
        <div class="issue-name">
          <span :title="issue.miniMode ? issue.name : ''">{{ issue.name }}</span>
        </div>
        <div v-if="issue.tags && issue.tags.length" class="issue-tags">
          <el-tag
            v-for="tag in issue.tags"
            :key="tag.id"
            :color="tag.color || '#999999'"
            effect="dark"
            size="small"
            class="issue-tag no-border"
            >{{ tag.name }}</el-tag
          >
        </div>
        <div
          v-if="issue.dueTime"
          :class="`due-time ${issue.dueTimePast ? 'past' : ''} ${issue.dueTimeAlmost ? 'almost' : ''} `"
          :title="`${
            issue.dueTimePast
              ? $t('issueCard.dueTimePast')
              : issue.dueTimeAlmost
                ? $t('issueCard.dueTimeAlmost')
                : $t('issueCard.dueTime')
          }`">
          <el-icon class="icon"><Calendar /></el-icon>
          <span class="time">{{ issue.dueTimeFormatted || issue.dueTime }}</span>
        </div>
        <div class="avatar-type-point-priority">
          <div class="issue-type">
            <issue-type-icon :type="issue.type" />
          </div>
          <div class="issue-code">
            <span>
              {{ issue.code }}
            </span>
          </div>
          <div class="issue-priority">
            <priority-icon :priority="issue.priority" />
          </div>
          <div class="issue-icon">
            <template v-if="issue.linksCount || issue.linkedCount">
              <el-icon
                class="comment-icon"
                :title="
                  $t('issueCard.links', {
                    count: issue.linksCount + issue.linkedCount
                  })
                ">
                <Connection />
              </el-icon>
            </template>
          </div>
          <div class="issue-icon">
            <template v-if="issue.filesCount">
              <el-icon class="comment-icon" :title="$t('issueCard.files', { count: issue.filesCount })">
                <Paperclip />
              </el-icon>
            </template>
          </div>
          <div class="issue-icon">
            <template v-if="issue.commentsCount">
              <el-icon class="comment-icon" :title="$t('issueCard.comments', { count: issue.commentsCount })">
                <ChatLineRound />
              </el-icon>
            </template>
          </div>
          <div class="issue-point">
            <div
              v-if="issue.storyPoints != null"
              :title="$t('issueCard.points', { count: issue.storyPoints })"
              class="story-point-tag">
              {{ issue.storyPoints }}
            </div>
          </div>
          <div class="issue-avatar issue-icon">
            <el-tooltip
              v-if="issue.owner && issue.owner.nickname"
              class="item"
              :content="issue.owner.nickname"
              placement="bottom">
              <avatar
                :name="issue.owner.nickname"
                :size="22"
                :src="issue.owner.avatarUrl"
                inline
                class="h-header-user-avatar"></avatar>
            </el-tooltip>
          </div>
        </div>
      </div>
    </el-card>
    <issue-edit
      v-if="issueDialogVisible"
      :editIssueId="issue.id"
      :projectId="project.id"
      @issueFormClosed="issueFormClosed"
      @onIssueUpdated="issueUpdated"
      @onIssueDeleted="issueDeleted"
      @onIssueLinked="issueLinked"
      @onIssueUnlinked="issueUnlinked" />
  </div>
</template>
<script>
import Avatar from '@/components/common/Avatar.vue'
import IssueEdit from '@/components/issue/IssueEdit.vue'
import { issueApi } from '@/api/issue.js'
import PriorityIcon from '@/components/common/PriorityIcon.vue'
import IssueTypeIcon from '@/components/common/IssueTypeIcon.vue'
import { ElMessageBox } from 'element-plus'

export default {
  data() {
    return {
      currentUser: this.$store.get('user'),
      projectMembers: [],
      issue: {},
      type: '',
      points: '',
      priorityTile: '',
      issueType: '',
      issueDialogVisible: false,
      editable: false
    }
  },
  components: {
    Avatar,
    IssueEdit,
    PriorityIcon,
    IssueTypeIcon
  },
  props: {
    issueDetails: {
      type: Object,
      default: () => {
        return {}
      }
    },
    project: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  mounted() {
    this.issue = JSON.parse(JSON.stringify(this.issueDetails))

    this.initProjectUsers()
    this.$bus.$on('projectMemberUpdate', (newProjectMembers) => {
      this.project.projectMembers = newProjectMembers
    })
  },
  watch: {
    issueDetails: {
      handler: function (newValue) {
        this.issue = JSON.parse(JSON.stringify(newValue))
      },
      deep: true
    },
    project: {
      handler: function (newValue, oldValue) {
        this.initProjectUsers()
      },
      deep: true
    }
  },
  methods: {
    initProjectUsers() {
      this.projectMembers = this.project.projectMembers
    },
    checkPermission() {
      this.editable = false
      let projectMember = this.project.projectMembers.find((member) => member.user.id == this.currentUser.id)
      if (projectMember.role == 'OWNER' || projectMember.role == 'DEVELOPER') {
        this.editable = true
      }
    },
    editIssue() {
      this.issueDialogVisible = true
    },
    issueFormClosed() {
      this.issueDialogVisible = false
    },
    handleCommand(command) {
      if (command === 'delete') {
        this.deleteIssue()
      } else if (command === 'clone') {
        this.cloneIssue()
      }
    },
    cloneIssue() {
      issueApi.clone(this.issue.id).then((res) => {
        const clonedIssue = res.data
        clonedIssue.miniMode = this.issue.miniMode
        this.$emit('issueCloned', this.issue, clonedIssue)
      })
    },
    deleteIssue() {
      ElMessageBox.confirm(
        this.$t('issueCard.msg.delIssueConfirmMsg', { issueName: this.issue.name }),
        this.$t('issueCard.msg.delIssueConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          issueApi.delete(this.issue.id).then(() => {
            this.issueDeleted(this.issue)
          })
        })
        .catch((err) => {
          // Cancelled, do nothing
        })
    },
    assignIssueToUser(user) {
      this.issue.owner = user

      issueApi.assign(this.issue.id, user.id).then((res) => {
        const updatedIssue = res.data
        updatedIssue.miniMode = this.issue.miniMode
        this.$emit('updateIssue', updatedIssue)
      })
    },
    unassign() {
      this.issue.owner = null
      issueApi.unassign(this.issue.id).then((res) => {
        const updatedIssue = res.data
        updatedIssue.miniMode = this.issue.miniMode
        this.$emit('updateIssue', updatedIssue)
      })
    },
    moveIssue(targetSprint) {
      let issueIds = [this.issue.id]
      issueApi.batchMove(targetSprint.id, issueIds).then((res) => {
        this.issue.sprint = targetSprint
        this.$emit('updateIssue', this.issue)
      })
    },
    toggleMiniMode() {
      this.issue.miniMode = !this.issue.miniMode
    },
    issueUpdated(issue) {
      issue.miniMode = this.issue.miniMode
      this.$emit('updateIssue', issue)
    },
    issueDeleted(issue) {
      this.$emit('deleteIssue', issue)
    },
    issueLinked(sourceIssue, selectedIssueId) {
      this.$emit('issueLinked', sourceIssue, selectedIssueId)
    },
    issueUnlinked(sourceIssue, unlinkIssue) {
      this.$emit('issueUnlinked', sourceIssue, unlinkIssue)
    }
  }
}
</script>

<style lang="less" scoped>
.assgin-to-me {
  margin-left: 8px;
}

.assignee-candidates,
.sprint-candidates {
  max-height: 350px;
  overflow: scroll;
}

.user-select-option {
  display: flex;

  .user-avatar {
    display: flex;
    align-items: center;
  }

  .username {
    margin-left: 10px;
  }
}

.issue-card-outter-container {
  position: relative;

  .more-actions-icon {
    position: absolute;
    right: 4px;
    top: 4px;
    color: #999999;
    visibility: hidden;
    cursor: pointer;

    .more-icon {
      padding: 4px 4px;
      border-radius: 5px;

      &:hover {
        color: var(--el-color-primary);
        background-color: #e7f5f3;
      }
    }
  }

  &:hover {
    .more-actions-icon {
      visibility: visible;
    }
  }
}

.issue-card {
  width: 280px;
  margin-bottom: 10px;
  border-color: #e0e3e6;
  border-radius: 6px;
  box-shadow: 0 0px 5px 0 #00000006;

  &:hover {
    border-color: #d7dbdf;
    box-shadow: 0 0px 5px 0 #0000000b;
  }

  .issue-card-body {
    display: flex;
    flex-direction: column;
    cursor: pointer;

    .issue-name {
      font-size: 14px;
      overflow-wrap: break-word;
      margin-bottom: 5px;
      color: #595959;
      line-height: 1.5;
    }

    .issue-tags {
      margin: 5px 0 2px 0;

      .issue-tag {
        margin-right: 3px;
        margin-bottom: 3px;
      }
    }

    .due-time {
      color: #bbbbbb;

      display: flex;
      align-items: center;
      margin-top: 5px;
      padding: 2px 0px;
      border-radius: 4px;

      &.almost {
        color: #ef8d05 !important;
        font-weight: 450;
      }

      &.past {
        color: red !important;
        font-weight: 450;
      }

      .icon {
        font-size: 12px;
        margin-right: 3px;
      }

      .time {
        font-size: 11px;
      }
    }

    .avatar-type-point-priority {
      height: 22px;
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #797979;
      margin-top: 6px;

      .issue-avatar {
        display: flex;
      }

      .issue-type {
        width: 18px;

        .box-card-font-letf {
          font-size: 12px;
        }
      }

      .issue-code {
        width: 80px;
        font-weight: 500;
      }

      .issue-priority {
        width: 20px;
      }

      .issue-icon {
        width: 24px;
        display: flex;
        align-items: center;

        .comment-icon {
          font-size: 16px;
          margin-top: 2px;
          margin-right: 2px;
        }
      }

      .issue-point {
        width: 38px;
        display: flex;
      }
    }
  }
}
</style>
<style lang="less">
.issue-card-outter-container {
  &.mini {
    .issue-card {
      .issue-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 2px;
        margin-right: 12px;
      }
      .issue-tags {
        display: none;
      }
      .due-time {
        display: none;
      }
      .avatar-type-point-priority {
        margin-top: 0;
      }

      .el-card__body {
        padding: 5px 12px;
      }
    }
  }
}
</style>
