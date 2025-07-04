<template>
  <div class="issue-type-selector-wrapper">
    <el-select
      v-model="value"
      :placeholder="placeholder"
      :multiple="multiple"
      :collapse-tags="false"
      :clearable="clearable"
      :teleported="teleported"
      :fit-input-width="false"
      popper-class="issue-type-selector">
      <el-option
        v-for="(type, index) in Object.keys(dict.issueTypes)"
        :key="index"
        :label="$t(`issueTypes.${type}`)"
        :value="type">
        <div class="issue-type-select-option">
          <issue-type-icon :type="type" />
          <div>{{ $t(`issueTypes.${type}`) }}</div>
        </div>
      </el-option>
      <template #label="{ label, value }">
        <div class="flex">
          <issue-type-icon :type="value" />
          <span>{{ label }}</span>
        </div>
      </template>
    </el-select>
  </div>
</template>

<script>
import dict from '@/locales/zh-cn/dict.json'
import IssueTypeIcon from '@/components/common/IssueTypeIcon.vue'

export default {
  components: {
    IssueTypeIcon
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

<style lang="less" scoped>
.issue-type-select-option {
  display: flex;
  margin-right: 12px;
}

.issue-type-icon-container {
  margin: 0 12px 0 6px;
}
</style>

<style lang="less">
.issue-type-selector-wrapper {
  width: 100%;
}
</style>
