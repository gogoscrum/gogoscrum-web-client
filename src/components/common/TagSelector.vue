<template>
  <div class="tag-selector-wrapper">
    <el-select
      v-model="value"
      :placeholder="placeholder"
      :multiple="multiple"
      :collapse-tags="false"
      :clearable="clearable"
      :disabled="disabled"
      :size="size"
      :fit-input-width="false"
      :teleported="teleported"
      value-key="id"
      popper-class="tag-selector">
      <el-option v-for="tag in tags" :key="tag.id" :label="tag.name" :value="tag">
        <issue-tag :tag="tag" class="tag-option" />
      </el-option>
      <template #label="{ label, value }">
        <issue-tag :tag="value" class="tag-option" />
      </template>
    </el-select>
  </div>
</template>

<script>
import IssueTag from '@/components/common/IssueTag.vue'

export default {
  name: 'TagSelector',
  components: {
    IssueTag
  },
  props: {
    modelValue: {
      type: [Object, Array],
      default: null
    },
    tags: {
      type: Array,
      default: () => {
        return []
      }
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
    disabled: {
      type: Boolean,
      default: false
    },
    teleported: {
      type: Boolean,
      default: true
    },
    size: {
      type: String,
      defaut: ''
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
    return {}
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="less" scoped>
.issue-type-select-option {
  display: flex;
  margin-right: 12px;
  .el-select {
    display: unset;
  }
}

.tag-selector {
  .tag-option {
    margin-right: 12px;
  }
}
</style>

<style lang="less">
.tag-selector-wrapper {
  width: 100%;
}
</style>
