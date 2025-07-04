<template>
  <div class="edit-component-container">
    <el-dialog
      :title="componentForm.id ? $t('componentList.edit.titleEdit') : $t('componentList.edit.titleNew')"
      v-model="dialogVisible"
      :fullscreen="isInMobile"
      :draggable="true"
      @close="$emit('closed')"
      width="520px">
      <el-form :model="componentForm" :rules="rules" ref="componentForm" label-width="80px">
        <el-form-item :label="$t('componentList.edit.name')" prop="name">
          <el-input v-model="componentForm.name" maxlength="100" show-word-limit clearable></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="default" class="no-border" @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button size="default" type="primary" class="no-border" @click="save()">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script>
import { componentApi } from '@/api/component.js'
import utils from '@/utils/util.js'
import { ElMessage } from 'element-plus'
export default {
  props: {
    component: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  emits: ['saved', 'closed'],
  data() {
    return {
      isInMobile: utils.isInMobile(),
      dialogVisible: true,
      componentForm: JSON.parse(JSON.stringify(this.component)),
      rules: {
        name: [
          {
            required: true,
            message: this.$t('componentList.msg.nameMissing'),
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
      this.$refs['componentForm'].validate((valid) => {
        if (valid) {
          if (this.componentForm.id) {
            componentApi.update(this.componentForm.id, this.componentForm).then((res) => {
              ElMessage.success({
                message: this.$t('componentList.msg.updateSuccess')
              })
              this.$emit('saved', res.data)
              this.dialogVisible = false
            })
          } else {
            componentApi.create(this.componentForm).then((res) => {
              ElMessage.success({
                message: this.$t('componentList.msg.createSuccess')
              })
              this.$emit('saved', res.data)
              this.dialogVisible = false
            })
          }
        } else {
          ElMessage.error({
            message: this.$t('common.msg.formValidationFail')
          })
          return false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.edit-component-container {
}
</style>
