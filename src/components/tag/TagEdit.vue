<template>
  <div class="edit-tag-container">
    <el-dialog
      :title="tag.id ? $t('tagEdit.titleEdit') : $t('tagEdit.titleNew')"
      v-model="dialogVisible"
      :fullscreen="isInMobile"
      :draggable="true"
      @close="$emit('tagFormClosed')"
      width="460px">
      <el-form :model="tag" :rules="rules" ref="tagForm" label-width="70px">
        <el-form-item :label="$t('tagEdit.name')" prop="name">
          <el-input v-model="tag.name" maxlength="20" clearable></el-input>
        </el-form-item>
        <el-form-item :label="$t('tagEdit.color')" prop="color">
          <div class="color-picker w-full">
            <el-input v-model="tag.color" type="color" maxlength="20" class="tag-color-picker-input">{{
              tag.color
            }}</el-input>
            <el-input v-model="tag.color" link maxlength="20" class="tag-color-value-input" clearable></el-input>
          </div>
          <div class="predefined-colors w-full mt-4">
            <div
              v-for="color in predefinedColors"
              :key="color"
              class="predefined-color-box"
              :style="`background-color: ${color}`"
              @click="pickColor(color)"></div>
          </div>
        </el-form-item>
        <el-form-item :label="$t('tagEdit.preview')">
          <el-tag :color="tag.color || '#999999'" effect="dark" class="no-border">
            {{ tag.name || 'Demo' }}
          </el-tag>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button size="default" class="no-border" @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button size="default" type="primary" class="no-border" @click="save">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { tagApi } from '@/api/tag.js'
import utils from '@/utils/util.js'
import { ElMessage } from 'element-plus'

export default {
  props: {
    projectId: {
      type: String,
      default: null
    },
    tagId: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      isInMobile: utils.isInMobile(),
      dialogVisible: true,
      tag: {
        color: '#999999',
        projectId: null
      },
      predefinedColors: [
        '#1b9aee',
        '#09c32e',
        '#880ac2',
        '#e89a11',
        '#0ca7bb',
        '#86cb06',
        '#09811d',
        '#ba1c70',
        '#da1616',
        '#88a207'
      ],
      rules: {
        name: [
          {
            required: true,
            message: this.$t('tagEdit.msg.nameMissing'),
            trigger: 'blur'
          },
          {
            max: 20,
            message: this.$t('tagEdit.msg.nameInvalid'),
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    if (this.tagId) {
      this.loadTag()
    } else {
      this.tag.projectId = this.projectId
    }
  },
  mounted() {},
  methods: {
    loadTag() {
      tagApi.get(this.tagId).then((res) => {
        this.tag = res.data
        this.tag.color = this.tag.color || '#999999'
      })
    },
    pickColor(color) {
      this.tag.color = color
    },
    save() {
      this.$refs['tagForm'].validate((valid) => {
        if (valid) {
          if (this.tag.id) {
            tagApi.update(this.tag.id, this.tag).then((res) => {
              ElMessage.success({
                message: this.$t('tagEdit.msg.editSuccess')
              })
              this.$emit('tagSaved', res.data)
              this.dialogVisible = false
            })
          } else {
            tagApi.create(this.tag).then((res) => {
              ElMessage.success({
                message: this.$t('tagEdit.msg.createSuccess')
              })
              this.$emit('tagSaved', res.data)
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

<style lang="less">
.edit-tag-container {
  .color-picker {
    display: flex;
    .tag-color-picker-input {
      width: 34px;
      margin-right: 10px;

      .el-input__wrapper {
        box-shadow: unset;
        border: none;
        padding: 0;

        .el-input__inner {
          cursor: pointer;
          height: 34px;
        }
      }
    }
  }

  .predefined-colors {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    .predefined-color-box {
      height: 20px;
      width: 20px;
      border-radius: 10px;
      cursor: pointer;
    }
  }
}
</style>
