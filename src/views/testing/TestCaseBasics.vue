<template>
  <div class="test-case-basics">
    <div class="case-name-row">
      <div class="case-name">
        <el-tag v-if="showCode" type="info" class="mr-2">TC-{{ testCase.code }}</el-tag>
        <span>{{ testCase.details?.name }}</span>
      </div>
      <el-tag v-if="showVersion" type="info" size="small" class="ml-4"
        >{{ $t('test.case.edit.version', { version: testCase.details.version }) }}
      </el-tag>
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
          <PriorityIcon :priority="testCase.details.priority" showLabel />
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
            show-name
            inline></Avatar>
          <span v-else class="ml-2">--</span>
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

    <template v-if="showDetails">
      <el-row class="mt-32px">
        <div class="label">{{ $t('test.case.edit.steps.label') }}</div>
        <el-table
          :data="testCase.details.steps"
          :empty-text="$t('test.case.edit.steps.empty')"
          :border="true"
          class="test-case-steps-table mt-10px">
          <el-table-column label="#" width="45" align="center">
            <template #default="scope">
              <div class="seq-badge">{{ scope.$index + 1 }}</div>
            </template>
          </el-table-column>
          <el-table-column :label="$t('test.case.edit.steps.description')" prop="description"> </el-table-column>
          <el-table-column :label="$t('test.case.edit.steps.expectation')" prop="expectation"> </el-table-column>
        </el-table>
      </el-row>

      <el-row class="mt-32px">
        <div class="w-full">
          <div class="label mb-10px">{{ $t('test.case.edit.files') }}</div>
          <FileUploader :files="testCase.files" readonly />
        </div>
      </el-row>
    </template>
  </div>
</template>
<script>
import PriorityIcon from '@/components/common/PriorityIcon.vue'
import Avatar from '@/components/common/Avatar.vue'
import FileUploader from '@/components/common/FileUploader.vue'

export default {
  name: 'TestCaseBasics',
  components: {
    PriorityIcon,
    Avatar,
    FileUploader
  },
  emits: [],
  props: {
    testCase: {
      type: Object,
      default: () => ({
        details: {}
      })
    },
    showDetails: {
      type: Boolean,
      default: false
    },
    showCode: {
      type: Boolean,
      default: false
    },
    showVersion: {
      type: Boolean,
      default: true
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
    align-items: start;
    margin-bottom: 32px;
    justify-content: space-between;

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
    }

    .label {
      width: 110px;
      font-weight: 500;
    }

    .value {
      flex: 1;
      display: flex;
      align-items: center;
    }
  }
}
</style>
