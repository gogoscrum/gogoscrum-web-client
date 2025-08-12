<template>
  <div class="test-case-basics">
    <div class="case-name-row">
      <el-tag type="info" class="mr-2">TC-{{ testCase.code }}</el-tag>
      <span class="case-name">{{ testCase.details?.name }}</span>
    </div>
    <el-row>
      <el-col :span="8">
        <div class="label">{{ $t('test.case.edit.type') }}</div>
        <div class="flex justify-between">
          <div class="value">
            {{ testCase.details.type ? $t(`testTypes.${testCase.details.type}`) : '--' }}
          </div>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="label">{{ $t('test.case.edit.priority') }}</div>
        <div class="value">
          <PriorityIcon :priority="testCase.details.priority" />
          <span class="ml-2">{{
            testCase.details.priority ? $t(`issuePriorities.${testCase.details.priority}`) : '--'
          }}</span>
        </div>
      </el-col>
      <el-col :span="8">
        <div class="label">{{ $t('test.case.edit.owner') }}</div>
        <div class="value">
          <Avatar
            v-if="testCase.details.owner"
            :name="testCase.details.owner.nickname"
            :size="22"
            :src="testCase.details.owner.avatarUrl"
            inline></Avatar>
          <span class="ml-2">{{ testCase.details.owner?.nickname || '--' }}</span>
        </div>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24">
        <div class="label">{{ $t('test.case.edit.description') }}</div>
        <div class="value">{{ testCase.details.description || '--' }}</div>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="24">
        <div class="label">{{ $t('test.case.edit.preconditions') }}</div>
        <div class="value">{{ testCase.details.preconditions || '--' }}</div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import PriorityIcon from '@/components/common/PriorityIcon.vue'
import Avatar from '@/components/common/Avatar.vue'

export default {
  name: 'TestCaseBasics',
  components: {
    PriorityIcon,
    Avatar
  },
  emits: [],
  props: {
    testCase: {
      type: Object,
      default: () => ({
        details: {}
      })
    }
  },
  data() {
    return {}
  },
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style lang="less" scoped>
.test-case-basics {
  .case-name-row {
    display: flex;
    align-items: center;
    margin-bottom: 16px;

    .case-name {
      font-size: 18px;
      font-weight: 500;
    }
  }

  .el-row {
    margin-bottom: 16px;
    color: var(--el-text-color-regular);
    font-size: 14px;
    line-height: 1.5;

    .el-col {
      display: flex;

      .label {
        width: 100px;
        font-weight: 500;
      }

      .value {
        flex: 1;
        display: flex;
        align-items: center;
      }
    }
  }
}
</style>
