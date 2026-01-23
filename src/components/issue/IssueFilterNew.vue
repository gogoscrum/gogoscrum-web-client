<template>
  <div class="issue-filter-container">
    <el-popover
      ref="filterPopover"
      :placement="placement"
      :teleported="false"
      :show-arrow="false"
      popper-class="issue-filter-popover"
      @show="init"
      width="320"
      trigger="click">
      <template #reference>
        <div class="filter-container more-action-icon" :title="$t('baseLayout.header.filter')">
          <el-badge v-if="filterActive" is-dot class="filter-count" type="primary">
            <i :class="`iconfont icon-filter ${filterActive ? 'active' : ''}`"></i>
          </el-badge>
          <i v-else class="iconfont icon-filter"></i>
        </div>
      </template>

      <div>
        <div class="issue-filter-header">
          <div class="title">{{ $t('issueFilter.title') }}</div>
          <el-icon class="close-icon more-action-icon" @click="hideFilter"><Close /></el-icon>
        </div>
        <template v-if="showShortcuts">
          <div :class="`filter-menu-item clickable ${showMineOnly ? 'active' : ''}`" @click="toggleViewMineOnly">
            <div class="flex items-center">
              <span class="prefix-icon iconfont icon-peoplelist" />
              {{ $t('baseLayout.header.filterPopover.mineOnly') }}
            </div>
            <el-icon v-if="showMineOnly"><Check /></el-icon>
          </div>
          <div
            :class="`filter-menu-item clickable ${filter.dueTimePast ? 'active' : ''}`"
            @click="toggleViewDueTimePast">
            <div class="flex items-center">
              <el-icon class="prefix-icon"><Timer /></el-icon>
              {{ $t('baseLayout.header.filterPopover.dueTimePast') }}
            </div>
            <el-icon v-if="filter.dueTimePast"><Check /></el-icon>
          </div>
          <el-divider></el-divider>
        </template>

        <el-form :model="filter" label-position="left" label-width="90" class="filter-form">
          <el-form-item v-if="fields.includes('keyword')" :label="$t('issueFilter.keyword')">
            <el-input v-model="filter.keyword" clearable @change="filterChanged" />
          </el-form-item>
          <el-form-item v-if="fields.includes('type')" :label="$t('issueEdit.issueType')">
            <issue-type-selector
              v-model="filter.types"
              :multiple="true"
              :clearable="true"
              :teleported="false"
              @change="filterChanged"></issue-type-selector>
          </el-form-item>
          <el-form-item v-if="fields.includes('priority')" :label="$t('issueEdit.priority')">
            <priority-selector
              v-model="filter.priorities"
              :multiple="true"
              :clearable="true"
              :teleported="false"
              @change="filterChanged"></priority-selector>
          </el-form-item>
          <el-form-item v-if="fields.includes('sprint')" :label="$t('issueEdit.sprint')">
            <el-select
              v-model="filter.sprintIds"
              :multiple="true"
              placeholder=""
              clearable
              :teleported="false"
              @change="filterChanged">
              <el-option v-for="sprint in project.sprints" :key="sprint.id" :label="sprint.name" :value="sprint.id">
              </el-option>
              <template #label="{ index, label, value }">
                <span v-if="project.sprints[index]">{{ label }}</span>
                <span v-else>Not found</span>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item v-if="fields.includes('status')" :label="$t('issueEdit.status')">
            <el-select
              v-model="filter.groupIds"
              :multiple="true"
              :fit-input-width="false"
              :teleported="false"
              placeholder=""
              clearable
              @change="filterChanged">
              <el-option
                v-for="group in project.issueGroups"
                :key="group.id"
                :label="group.label"
                :value="group.id"
                class="issue-group-option">
                <status-tag :status="group.status" :label="group.label" class="mr-12px" />
              </el-option>
              <template #label="{ index, label, value }">
                <status-tag
                  v-if="project.issueGroups[index]"
                  :status="project.issueGroups[index].status"
                  :label="label" />
                <span v-else>Not found</span>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item v-if="fields.includes('tag')" :label="$t('issueEdit.tag')">
            <el-select
              v-model="filter.tagIds"
              :multiple="true"
              :fit-input-width="false"
              :teleported="false"
              placeholder=""
              clearable
              @change="filterChanged">
              <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag.id">
                <el-tag
                  size="small"
                  effect="dark"
                  :hit="false"
                  class="no-border mr-12px"
                  :color="tag.color || '#999999'">
                  {{ tag.name }}
                </el-tag>
              </el-option>
              <template #label="{ index, label, value }">
                <el-tag
                  v-if="tags[index]"
                  size="small"
                  effect="dark"
                  :hit="false"
                  class="no-border"
                  :color="tags[index].color || '#999999'">
                  {{ label }}
                </el-tag>
                <span v-else>Not found</span>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item v-if="fields.includes('assignee')" :label="$t('issueEdit.assignee')">
            <el-select
              v-model="filter.ownerIds"
              :multiple="true"
              :fit-input-width="false"
              :teleported="false"
              placeholder=""
              clearable
              @change="filterChanged">
              <el-option
                v-for="member in project.projectMembers"
                :key="member.id"
                :label="member.user.nickname"
                :value="member.user.id">
                <div class="user-select-option">
                  <div class="user-avatar">
                    <avatar :name="member.user.nickname" :size="24" :src="member.user.avatarUrl"></avatar>
                  </div>
                  <div class="username">{{ member.user.nickname }}</div>
                </div>
              </el-option>
              <template #label="{ index, label, value }">
                <div v-if="project.projectMembers[index]" class="flex items-center">
                  <avatar
                    :name="project.projectMembers[index].user.nickname"
                    :size="24"
                    :src="project.projectMembers[index].user.avatarUrl"></avatar>
                  <span class="ml-2">{{ label }}</span>
                </div>
                <span v-else>Not found</span>
              </template>
            </el-select>
          </el-form-item>
          <el-form-item v-if="fields.includes('component')" :label="$t('issueEdit.component')">
            <el-cascader
              v-model="filter.componentIds"
              :options="components"
              :props="componentProps"
              :teleported="false"
              placeholder=""
              clearable
              :show-all-levels="false"
              :collapse-tags="false"
              :collapse-tags-tooltip="true"
              @change="filterChanged" />
          </el-form-item>
        </el-form>
        <div class="flex bottom-actions">
          <el-button @click="resetFilter" class="!px-8px">{{ $t('issueFilter.actions.clear') }}</el-button>
          <el-button :loading="filterUpdating" @click="saveFilter" text type="primary" class="!ml-auto">{{
            $t('common.save')
          }}</el-button>
          <el-dropdown trigger="click" :teleported="false" size="default">
            <el-button class="!px-7px">
              <el-icon :size="16" class="action-icon"><MoreFilled /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :disabled="!filter.id" @click="saveFilterAs">{{
                  $t('issueFilter.actions.saveAs')
                }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-popover>
    <IssueFilterEdit
      v-if="showFilterEdit"
      :original-filter="filter"
      @closed="showFilterEdit = false"
      @saved="filterSaved" />
  </div>
</template>

<script>
import IssueTypeSelector from '@/components/common/IssueTypeSelector.vue'
import PrioritySelector from '@/components/common/PrioritySelector.vue'
import MemberSelector from '@/components/common/MemberSelector.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import Avatar from '@/components/common/Avatar.vue'
import IssueFilterEdit from '@/components/issue/IssueFilterEdit.vue'
import { tagApi } from '@/api/tag.js'
import { componentApi } from '@/api/component.js'
import { issueFilterApi } from '@/api/issue.js'
import { ElMessage } from 'element-plus'

export default {
  components: {
    IssueTypeSelector,
    PrioritySelector,
    MemberSelector,
    StatusTag,
    Avatar,
    IssueFilterEdit
  },
  props: {
    modelValue: {
      type: Object,
      default: () => {
        return {
          dueTimePast: false,
          types: [],
          priorities: [],
          sprintIds: [],
          groupIds: [],
          tagIds: [],
          ownerIds: [],
          componentIds: []
        }
      }
    },
    project: {
      type: Object,
      default: () => {
        return {}
      }
    },
    showShortcuts: {
      type: Boolean,
      default: false
    },
    fields: {
      type: Array,
      default: () => {
        return ['keyword', 'type', 'priority', 'assignee', 'tag', 'sprint', 'status', 'component']
      }
    },
    placement: {
      type: String,
      default: 'bottom'
    }
  },
  watch: {
    project: {
      handler: function (newValue, oldValue) {
        if (newValue.id !== oldValue.id) {
          this.clearFilter()
        }
      },
      deep: true
    },
    modelValue: {
      handler: function (newValue) {
        this.filter = JSON.parse(JSON.stringify(newValue))
      },
      deep: true
    }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      currentUser: this.$store.get('user'),
      tags: [],
      components: [],
      componentProps: {
        label: 'name',
        value: 'id',
        multiple: true,
        emitPath: false,
        checkStrictly: true,
        expandTrigger: 'hover'
      },
      filter: {},
      showFilterEdit: false,
      filterUpdating: false
    }
  },
  computed: {
    filterActive() {
      return (
        this.filter &&
        (this.filter.dueTimePast ||
          this.filter.keyword ||
          this.filter.types?.length ||
          this.filter.ownerIds?.length ||
          this.filter.priorities?.length ||
          this.filter.tagIds?.length ||
          this.filter.sprintIds?.length ||
          this.filter.groupIds?.length ||
          this.filter.componentIds?.length)
      )
    },
    showMineOnly() {
      return this.filter && this.filter.ownerIds.length === 1 && this.filter.ownerIds[0] === this.currentUser.id
    }
  },
  created() {
    this.filter = JSON.parse(JSON.stringify(this.modelValue))
  },
  methods: {
    init() {
      this.loadTags()
      this.loadComponents()
    },
    loadTags() {
      tagApi.search({ projectId: this.project.id, pageSize: 100 }).then((res) => {
        this.tags = res.data.results
      })
    },
    loadComponents() {
      componentApi.getTree(this.project.id).then((response) => {
        this.components = response.data?.children || []
      })
    },
    toggleViewMineOnly() {
      if (this.showMineOnly) {
        this.filter.assignees = []
      } else {
        this.filter.assignees = [this.currentUser]
      }
      this.filterChanged()
      this.hideFilter()
    },
    toggleViewDueTimePast() {
      this.filter.dueTimePast = !this.filter.dueTimePast
      this.filterChanged()
      this.hideFilter()
    },
    clearFilter() {
      this.filter = this.newFilter()
    },
    newFilter() {
      return {
        dueTimePast: false,
        types: [],
        priorities: [],
        sprintIds: [],
        groupIds: [],
        tagIds: [],
        ownerIds: [],
        componentIds: []
      }
    },
    resetFilter() {
      this.clearFilter()
      this.filterChanged()
      // this.hideFilter()
    },
    saveFilter() {
      if (this.filter.id) {
        this.filterUpdating = true
        issueFilterApi
          .update(this.filter.id, this.filter)
          .then((res) => {
            ElMessage.success({
              message: this.$t('issueFilter.msg.filterUpdated')
            })

            this.$bus.$emit('issueFilterUpdated', res.data)
          })
          .finally(() => {
            // Delay a little bit to improve user experience
            setTimeout(() => {
              this.filterUpdating = false
            }, 200)
          })
      } else {
        this.showFilterEdit = true
      }
    },
    saveFilterAs() {
      this.filter.id = null
      this.showFilterEdit = true
    },
    filterSaved(filter) {
      this.filter = filter
      this.$router.push({ name: 'IssueList', params: { projectId: this.projectId }, query: { filterId: filter.id } })
    },
    hideFilter() {
      this.$refs.filterPopover.hide()
    },
    filterChanged() {
      this.$emit('update:modelValue', this.filter)
      this.$emit('change', this.filter)
    }
  }
}
</script>

<style lang="less">
.issue-filter-container {
  .icon-filter {
    width: 16px;
    height: 16px;
    opacity: 0.75;
    margin-bottom: 1px;

    &.active {
      color: var(--el-color-primary);
    }
  }
  .filter-container {
    display: flex;

    .filter-count {
      sup {
        top: 2px;
        right: 6px;
      }
    }
  }
  .issue-filter-popover {
    padding: 12px 0;

    .issue-filter-header {
      position: relative;

      .title {
        margin-bottom: 8px;
        font-size: 16px;
        font-weight: 500;
        text-align: center;
      }

      .close-icon {
        position: absolute;
        right: 18px;
        top: 0;
        cursor: pointer;
      }
    }

    .filter-form {
      max-height: 60vh;
      overflow-y: auto;
      padding: 12px 12px 12px 20px;
      // padding: 4px 8px 0 20px;
    }

    .filter-menu-item {
      padding: 6px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &:hover {
        color: var(--el-color-primary);
        background-color: #e7f5f3;
      }

      &.active {
        font-weight: 500;
        color: var(--el-color-primary);
      }

      .prefix-icon {
        font-size: 16px;
        margin: 0 10px 0 5px;
      }
    }

    .el-divider {
      margin: 8px 0;
    }
    .el-select,
    .el-cascader,
    .el-input {
      width: 100%;

      .el-select__wrapper,
      .el-input__wrapper,
      .el-input__wrapper {
        box-shadow: none;
        &:hover {
          background-color: #f9f9f9;
        }
      }
    }

    .el-form-item {
      margin-bottom: 8px;
    }

    .user-select-option {
      display: flex;
      margin-right: 12px;

      .user-avatar {
        margin-right: 8px;
        display: flex;
        align-items: center;
      }
    }

    .bottom-actions {
      margin-top: 10px;
      padding: 0 12px;
      justify-content: flex-end;
    }
  }
}
</style>
