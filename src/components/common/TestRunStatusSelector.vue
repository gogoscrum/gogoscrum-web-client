<template>
  <div class="test-run-status-selector-wrapper">
    <el-select
      v-model="value"
      :placeholder="placeholder"
      :clearable="clearable"
      :size="size"
      :fit-input-width="false"
      :teleported="teleported"
      popper-class="test-run-status-selector">
      <el-option
        v-for="(status, index) in Object.keys(dict.testRunStatuses)"
        :key="index"
        :label="$t(`testRunStatuses.${status}`)"
        :value="status">
        <div class="status-select-option">
          <TestRunStatusIcon :status="status" />
        </div>
      </el-option>
      <template #label="{ label, value }">
        <TestRunStatusIcon :status="value" />
      </template>
    </el-select>
  </div>
</template>

<script>
import TestRunStatusIcon from '@/components/common/TestRunStatusIcon.vue'
import dict from '@/locales/zh-cn/dict.json'

export default {
  components: {
    TestRunStatusIcon
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
      default: true
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
.test-run-status-selector-wrapper {
  width: 100%;
  .el-select__prefix {
    margin: 0 4px 0 6px;
  }

  .el-select {
    display: unset;
  }
}
</style>

<style lang="less">
.test-run-status-selector {
  .status-select-option {
    display: flex;
    align-content: center;
  }
}

// .priority-icon-container {
//   margin: 0 12px 0 6px;
// }
</style>
