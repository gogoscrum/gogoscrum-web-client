<template>
  <div class="issue-row-container">
    <el-row type="flex">
      <el-col :xs="10" :sm="15">
        <div class="flex">
          <issue-type-icon :type="issue.type" class="issue-type-icon" />
          <div class="code">
            <span v-html="issue.codeHighlightLabel || issue.code"></span>
          </div>
          <div v-if="!isInMobile" class="name">
            <span v-html="issue.nameHighlightLabel || issue.name"></span>
          </div>
        </div>
      </el-col>
      <el-col v-if="!isInMobile" :xs="3" :sm="3" class="flex ml-1">
        <el-tooltip v-if="issue.componentName" placement="bottom" :content="issue.componentName">
          <el-tag effect="plain" round>
            <div class="component-tag">{{ issue.componentName }}</div></el-tag
          >
        </el-tooltip>
      </el-col>
      <el-col v-if="!isInMobile" :xs="3" :sm="1" class="flex justify-center">
        <el-tooltip
          v-if="issue.storyPoints != null"
          placement="bottom"
          :content="$t('issueRow.storyPoint', { points: issue.storyPoints })">
          <div class="story-point-tag">
            {{ issue.storyPoints }}
          </div>
        </el-tooltip>
      </el-col>
      <el-col :xs="3" :sm="1" class="flex justify-center">
        <priority-icon :priority="issue.priority" />
      </el-col>
      <el-col :xs="2" :sm="1" class="flex">
        <el-tooltip
          v-if="issue.owner && issue.owner.nickname"
          :content="$t('issueRow.assignee', { assignee: issue.owner.nickname })"
          placement="left">
          <avatar
            :name="issue.owner.nickname"
            :size="22"
            :src="issue.owner.avatarUrl"
            inline
            class="h-header-user-avatar"></avatar>
        </el-tooltip>
      </el-col>
      <el-col :xs="8" :sm="2" class="flex-row">
        <status-tag v-if="issue.issueGroup" :status="issue.issueGroup.status" :label="issue.issueGroup.label" />
      </el-col>
    </el-row>
    <el-row v-if="isInMobile" class="issue-name-row">
      <span v-html="issue.nameHighlightLabel || issue.name"></span>
    </el-row>
  </div>
</template>

<script>
import Avatar from '@/components/common/Avatar.vue'
import PriorityIcon from '@/components/common/PriorityIcon.vue'
import IssueTypeIcon from '@/components/common/IssueTypeIcon.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import utils from '@/utils/util.js'

export default {
  components: {
    Avatar,
    PriorityIcon,
    IssueTypeIcon,
    StatusTag
  },
  props: {
    issueDetails: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      isInMobile: utils.isInMobile(),
      issue: {}
    }
  },
  mounted() {
    this.issue = JSON.parse(JSON.stringify(this.issueDetails))
  },
  watch: {
    issueDetails: {
      handler: function (newValue) {
        this.issue = JSON.parse(JSON.stringify(newValue))
      },
      deep: true
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>
.issue-row-container {
  .issue-type-icon {
    height: 23px;
  }

  .code {
    min-width: 100px;
    margin: 0 10px;
    font-weight: bold;
    color: var(--el-color-primary);
    white-space: nowrap;
  }

  .story-point-tag {
    height: 20px;
    line-height: 16px;

    &:hover {
      background-color: #dddddd;
    }
  }

  .component-tag {
    max-width: 80px;
    text-overflow: ellipsis;
    overflow-x: clip;
  }

  .issue-name-row {
    margin-top: 5px;
  }
}
</style>
