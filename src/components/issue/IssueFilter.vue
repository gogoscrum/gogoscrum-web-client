<template>
  <div class="board-issue-filter-container">
    <el-popover
      ref="filterPopover"
      placement="bottom"
      :teleported="false"
      popper-class="issue-filter-popover"
      @show="onShow"
      width="280"
      trigger="click">
      <template #reference>
        <div class="filter-container" :title="$t('baseLayout.header.filter')">
          <el-badge v-if="filterCount" :is-dot="true" class="filter-count" type="primary">
            <i :class="`iconfont icon-filter ${filterActive ? 'active' : ''}`"></i>
          </el-badge>
          <i v-else :class="`iconfont icon-filter ${filterActive ? 'active' : ''}`"></i>
        </div>
      </template>

      <div>
        <div class="filter-menu-item clickable" @click="viewMineOnly">
          <div class="flex items-center">
            <span class="prefix-icon iconfont icon-peoplelist" />
            {{ $t('baseLayout.header.filterPopover.mineOnly') }}
          </div>
        </div>
        <div :class="`filter-menu-item clickable ${filter.dueTimePast ? 'active' : ''}`" @click="toggleViewDueTimePast">
          <div class="flex items-center">
            <el-icon class="prefix-icon"><Timer /></el-icon>
            {{ $t('baseLayout.header.filterPopover.dueTimePast') }}
          </div>
          <el-icon v-if="filter.dueTimePast"><Check /></el-icon>
        </div>
        <el-divider></el-divider>
        <el-form :model="filter" label-position="top" class="filter-form">
          <el-form-item :label="$t('issueEdit.issueType')">
            <issue-type-selector
              v-model="filter.types"
              :multiple="true"
              :clearable="true"
              :teleported="false"
              @change="filterChanged"></issue-type-selector>
          </el-form-item>
          <el-form-item :label="$t('issueEdit.priority')">
            <priority-selector
              v-model="filter.priorities"
              :multiple="true"
              :clearable="true"
              :teleported="false"
              @change="filterChanged"></priority-selector>
          </el-form-item>
          <el-form-item :label="$t('issueEdit.tag')">
            <tag-selector
              v-model="filter.tags"
              :tags="tags"
              :multiple="true"
              :clearable="true"
              :teleported="false"
              @change="filterChanged"></tag-selector>
          </el-form-item>
          <el-form-item :label="$t('issueEdit.assignee')">
            <member-selector
              v-model="filter.assignees"
              :members="project.projectMembers"
              :multiple="true"
              :clearable="true"
              :teleported="false"
              @change="filterChanged"></member-selector>
          </el-form-item>
        </el-form>
        <div class="reset-filter-row">
          <el-button type="danger" plain :disabled="!filterActive" @click="resetFilter">{{
            $t('baseLayout.header.filterPopover.clear')
          }}</el-button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script>
import IssueTypeSelector from '@/components/common/IssueTypeSelector.vue'
import PrioritySelector from '@/components/common/PrioritySelector.vue'
import MemberSelector from '@/components/common/MemberSelector.vue'
import TagSelector from '@/components/common/TagSelector.vue'
import { tagApi } from '@/api/tag.js'

export default {
  components: {
    IssueTypeSelector,
    PrioritySelector,
    MemberSelector,
    TagSelector
  },
  props: {
    modelValue: {
      type: Object,
      default: () => {
        return {
          dueTimePast: false,
          types: [],
          priorities: [],
          assignees: [],
          tags: []
        }
      }
    },
    project: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  watch: {
    project: {
      handler: function (newValue, oldValue) {
        if (newValue.id !== oldValue.id) {
          this.clearFilter()
          this.tagLoaded = false
        }
      },
      deep: true
    }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return {
      currentUser: this.$store.get('user'),
      tags: [],
      tagLoaded: false,
      filter: {
        dueTimePast: false,
        types: [],
        priorities: [],
        assignees: [],
        tags: []
      }
    }
  },
  computed: {
    filterActive() {
      return (
        this.filter &&
        (this.filter.dueTimePast ||
          this.filter.types.length ||
          this.filter.assignees.length ||
          this.filter.priorities.length ||
          this.filter.tags.length)
      )
    },
    filterCount() {
      let count = 0

      if (this.filter.dueTimePast) {
        count++
      }
      if (this.filter.types.length) {
        count++
      }
      if (this.filter.priorities.length) {
        count++
      }
      if (this.filter.assignees.length) {
        count++
      }
      if (this.filter.tags.length) {
        count++
      }
      return count
    }
  },
  mounted() {
    this.filter = JSON.parse(JSON.stringify(this.modelValue))
  },
  methods: {
    onShow() {
      if (!this.tagLoaded) {
        this.loadTags()
      }
    },
    loadTags() {
      tagApi.search({ projectId: this.project.id, pageSize: 100 }).then((res) => {
        this.tags = res.data.results
        this.tagLoaded = true
      })
    },
    viewMineOnly() {
      this.filter.assignees = [this.currentUser]
      this.filterChanged()
      this.hideFilter()
    },
    toggleViewDueTimePast() {
      this.filter.dueTimePast = !this.filter.dueTimePast
      this.filterChanged()
      this.hideFilter()
    },
    clearFilter() {
      this.filter = {
        dueTimePast: false,
        types: [],
        priorities: [],
        assignees: [],
        tags: []
      }
    },
    resetFilter() {
      this.clearFilter()
      this.filterChanged()
      this.hideFilter()
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
.board-issue-filter-container {
  .icon-filter {
    width: 16px;
    height: 16px;
    opacity: 0.8;

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

    .filter-form {
      padding: 0 12px;
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
    .el-select {
      width: 100%;
    }

    .el-form-item {
      margin-bottom: 8px;
    }

    .el-form-item__label {
      padding-bottom: 0px;
    }

    .reset-filter-row {
      margin-top: 20px;
      button {
        width: 90%;
        margin: 0 5%;
      }
    }
  }
}
</style>
