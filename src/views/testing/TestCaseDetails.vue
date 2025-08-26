<template>
  <div class="test-case-details-page page">
    <div class="title">
      <div class="left-part flex items-center">
        <span>{{ $t('test.case.details.title') }}</span>
        <el-tag v-if="testCase.code" type="info" class="ml-4">TC-{{ testCase.code }}</el-tag>
      </div>
      <div class="old-version-warning" v-if="isOldVersion">
        <el-icon class="text-lg mr-1"><WarnTriangleFilled /></el-icon>
        <span>{{ $t('test.case.edit.msg.oldVersion') }}</span>
      </div>
      <div class="right-part flex items-center">
        <el-dropdown v-if="testCase.latestVersion >= 1" trigger="click" class="ml-20px mt-2px mr-32px">
          <el-tag type="info" size="small"
            >{{ $t('test.case.edit.version', { version: testCase.details.version }) }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </el-tag>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="version in listVersions" :key="version" @click.native="loadDetails(version)">
                <span>{{ $t('test.case.edit.version', { version: version }) }}</span>
                <el-icon v-if="version === testCase.details.version" class="ml-2"><Check /></el-icon>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button text type="primary" @click="$router.go(-1)">
          {{ $t('common.back') }}
        </el-button>
        <el-dropdown trigger="click" placement="bottom">
          <el-button text icon="MoreFilled"> </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item icon="Edit" @click.native="editCase">{{ $t('common.edit') }}</el-dropdown-item>
              <el-dropdown-item icon="DocumentCopy" @click.native="cloneCase">{{ $t('common.copy') }}</el-dropdown-item>
              <el-dropdown-item icon="Delete" @click.native="deleteCase">{{ $t('common.delete') }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <TestCaseBasics :testCase="testCase" showDetails :showVersion="false" />
    <el-tabs v-model="activeTab" type="card" class="mt-10">
      <el-tab-pane :label="$t('test.case.details.tabRuns')" name="runs" class="tab-runs">
        <TestRunList :show-empty-icon="false" />
      </el-tab-pane>
      <el-tab-pane lazy :label="$t('test.case.details.tabBugs')" name="bugs">
        <IssueListNew
          :project-id="projectId"
          :test-case="testCase"
          :issue-filter="issueFilter"
          :show-export-btn="false"
          :empty-text="$t('test.case.details.noBugs')" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { testCaseApi } from '@/api/testing.js'
import TestCaseBasics from './TestCaseBasics.vue'
import TestRunList from './TestRunList.vue'
import IssueListNew from '@/components/issue/IssueListNew.vue'

export default {
  name: 'TestCaseDetails',
  components: {
    TestCaseBasics,
    TestRunList,
    IssueListNew
  },
  props: {},
  data() {
    return {
      projectId: this.$route.params.projectId,
      project: {},
      testCaseId: this.$route.params.testCaseId,
      testCase: {
        details: {}
      },
      activeTab: 'runs',
      issueFilter: {
        testCaseId: this.$route.params.testCaseId,
        types: ['BUG']
      }
    }
  },
  computed: {
    isOldVersion() {
      return this.testCase.latestVersion !== this.testCase.details.version
    },
    listVersions() {
      return Array.from({ length: this.testCase.latestVersion }, (_, i) => this.testCase.latestVersion - i)
    }
  },
  created() {
    this.project = this.$store.get('project')
    if (this.testCaseId) {
      this.loadCase()
    }
  },
  mounted() {},
  methods: {
    loadCase() {
      testCaseApi.get(this.testCaseId).then((res) => {
        this.testCase = res.data
      })
    },
    loadDetails(version) {
      testCaseApi.getDetails(this.testCaseId, version).then((response) => {
        this.testCase.details = response.data
      })
    },
    editCase() {
      this.$router.push({ name: 'TestCaseEdit', params: { testCaseId: this.testCaseId } })
    },
    cloneCase() {
      testCaseApi.clone(this.testCaseId).then((res) => {
        ElMessage.success({
          message: this.$t('test.case.list.msg.caseCopied')
        })
        // Jump to the clone case details page
        this.$router.push({ name: 'TestCaseDetails', params: { testCaseId: res.data.id } })
      })
    },
    deleteCase() {
      ElMessageBox.confirm(
        this.$t('test.case.edit.msg.delConfirmMsg', { caseName: this.testCase.details.name }),
        this.$t('test.case.edit.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          testCaseApi.delete(this.testCase.id).then(() => {
            ElMessage.success(this.$t('test.case.edit.msg.delSuccess'))
            this.$router.push({
              name: 'TestCaseList',
              params: { projectId: this.projectId }
            })
          })
        })
        .catch(() => {
          // Cancelled, do nothing
        })
    }
  }
}
</script>

<style lang="less" scoped>
.test-case-details-page {
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .old-version-warning {
    margin-left: 32px;
    color: orange;
    display: flex;
    align-items: center;
    font-size: 13px;
    font-weight: 500;
  }
}
</style>

<style lang="less">
.test-case-details-page {
  .tab-runs {
    .test-runs-list-page {
      padding: unset;
    }
  }
}
</style>
