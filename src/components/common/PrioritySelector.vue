<template>
  <div class="priority-selector-wrapper">
    <el-select
      v-model="value"
      :placeholder="placeholder"
      :multiple="multiple"
      :collapse-tags="false"
      :clearable="clearable"
      :size="size"
      :fit-input-width="false"
      :teleported="teleported"
      popper-class="priority-selector">
      <el-option
        v-for="(priority, index) in Object.keys(dict.issuePriorities)"
        :key="index"
        :label="$t(`issuePriorities.${priority}`)"
        :value="priority">
        <div class="priority-select-option">
          <priority-icon :priority="priority" showLabel />
        </div>
      </el-option>
      <template #label="{ label, value }">
        <div class="flex">
          <priority-icon :priority="value" showLabel />
        </div>
      </template>
    </el-select>
  </div>
</template>

<script>
import PriorityIcon from '@/components/common/PriorityIcon.vue'
import dict from '@/locales/zh-cn/dict.json'

export default {
  components: {
    PriorityIcon
  },
  props: {
    modelValue: {
      type: [String, Array],
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    clearable: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    collapseTags: {
      type: Boolean,
      default: false
    },
    teleported: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      defaut: 'default'
    }
  },
  emits: ['update:modelValue', 'change'],
  computed: {
    value: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
        this.$emit('change', value)
      }
    }
  },
  data() {
    return {
      dict
    }
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="less">
.priority-selector-wrapper {
  width: 100%;
  .el-select__prefix {
    margin: 0 4px 0 6px;
  }

  .el-select {
    display: unset;
  }

  .priority-icon-container {
    .priority-icon {
      margin: 0 4px 0 6px;
    }
  }
}
</style>
