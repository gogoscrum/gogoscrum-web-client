<template>
  <div class="issue-filter-edit">
    <el-dialog
      :title="filter.id ? $t('issueFilter.edit.titleEdit') : $t('issueFilter.edit.titleNew')"
      v-model="dialogVisible"
      width="480px"
      :fullscreen="isInMobile"
      top="25vh"
      @closed="$emit('closed')">
      <el-form ref="filterForm" :model="filter" :rules="rules" label-width="68px">
        <el-form-item :label="$t('issueFilter.edit.name')" prop="name">
          <el-input v-model="filter.name" maxlength="100" clearable></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="default" class="no-border" @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button :loading="saving" size="default" type="primary" class="no-border" @click="save">{{
          $t('common.save')
        }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { issueFilterApi } from '@/api/issue.js'
import utils from '@/utils/util.js'
import { ElMessage } from 'element-plus'

export default {
  name: 'IssueFilterEdit',
  props: {
    originalFilter: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  emits: ['closed', 'saved'],
  data() {
    return {
      isInMobile: utils.isInMobile(),
      dialogVisible: true,
      filter: JSON.parse(JSON.stringify(this.originalFilter)),
      saving: false,
      rules: {
        name: [
          {
            required: true,
            message: this.$t('issueFilter.msg.nameMissing'),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {},
  mounted() {},
  methods: {
    save() {
      this.$refs['filterForm'].validate((valid) => {
        if (valid) {
          this.saving = true
          if (this.filter.id) {
            issueFilterApi
              .update(this.filter.id, this.filter)
              .then((res) => {
                ElMessage.success({
                  message: this.$t('issueFilter.msg.filterUpdated')
                })
                this.$bus.$emit('issueFilterUpdated', res.data)
                this.$emit('saved', res.data)
                this.dialogVisible = false
              })
              .finally(() => {
                this.saving = false
              })
          } else {
            issueFilterApi
              .create(this.filter)
              .then((res) => {
                ElMessage.success({
                  message: this.$t('issueFilter.msg.filterSaved')
                })

                this.$bus.$emit('issueFilterCreated', res.data)
                this.$emit('saved', res.data)
                this.dialogVisible = false
              })
              .finally(() => {
                this.saving = false
              })
          }
        } else {
          ElMessage.error({
            message: this.$t('common.msg.formValidationFail')
          })
        }
      })
    }
  }
}
</script>

<style lang="less">
.issue-filter-edit {
}
</style>
