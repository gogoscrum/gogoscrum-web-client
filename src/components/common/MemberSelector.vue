<template>
  <div class="member-selector-wrapper">
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
      :filterable="filterable"
      value-key="id"
      popper-class="member-selector">
      <el-option v-for="member in members" :key="member.id" :label="member.user.nickname" :value="member.user">
        <div class="user-select-option">
          <div class="user-avatar">
            <avatar :name="member.user.nickname" :size="24" :src="member.user.avatarUrl"></avatar>
          </div>
          <div class="username">{{ member.user.nickname }}</div>
        </div>
      </el-option>
      <template #label="{ label, value }">
        <div class="flex items-center">
          <avatar :name="value.nickname" :size="24" :src="value.avatarUrl"></avatar>
          <span class="ml-2">{{ label }}</span>
        </div>
      </template>
    </el-select>
  </div>
</template>

<script>
import Avatar from '@/components/common/Avatar.vue'

export default {
  props: {
    modelValue: {
      type: [Object, Array],
      default: null
    },
    members: {
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
    filterable: {
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
  components: {
    Avatar
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
.member-selector-wrapper {
  width: 100%;
  .el-select {
    display: unset;
  }
  .el-select__prefix {
    margin: 0 4px 0 6px;
  }
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
</style>
<style lang="less">
.member-selector-wrapper {
  .el-select__wrapper.is-disabled {
    background-color: unset;
  }
}
</style>
