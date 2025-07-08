<template>
  <div class="component-tree-page page">
    <div class="header">
      <el-button
        :disabled="readonly"
        text
        type="primary"
        @click="create"
        class="text-icon-btn"
        icon="CirclePlusFilled"
        >{{ $t('componentList.header.new') }}</el-button
      >
      <el-button
        text
        type="primary"
        @click="toggleExpandAll"
        class="text-icon-btn"
        :icon="expandAll ? 'Folder' : 'FolderOpened'"
        >{{ expandAll ? $t('componentList.header.collapse') : $t('componentList.header.expand') }}</el-button
      >
    </div>
    <div class="main">
      <el-table
        v-if="components?.length"
        :data="components"
        ref="componentList"
        row-key="id"
        :show-header="false"
        :default-expand-all="expandAll">
        <el-table-column prop="name" :label="$t('componentList.list.name')" min-width="200">
          <template #default="scope">
            <el-tag effect="plain" round class="component-tag"> {{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('componentList.list.creator')" min-width="50">
          <template #default="scope">
            <el-tooltip
              v-if="scope.row.createdBy"
              :content="
                $t('componentList.list.creatorTip', {
                  nickname: scope.row.createdBy.nickname,
                  createdTime: scope.row.createdTime
                })
              "
              placement="left">
              <avatar
                :name="scope.row.createdBy.nickname"
                :size="22"
                :src="scope.row.createdBy.avatarUrl"
                inline></avatar>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column v-if="!readonly" :label="$t('common.actions')" width="80" class-name="actions-column">
          <template #default="scope">
            <el-dropdown trigger="click" placement="bottom">
              <div class="more-action-icon" @click.stop>
                <el-icon><MoreFilled /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item icon="Plus" @click.native="create(scope.row)">
                    {{ $t('componentList.list.newSub') }}</el-dropdown-item
                  >
                  <el-dropdown-item icon="Edit" @click.native="edit(scope.row)">
                    {{ $t('common.edit') }}</el-dropdown-item
                  >
                  <el-dropdown-item
                    icon="Delete"
                    :disabled="scope.row.children.length > 0"
                    @click.native="del(scope.$index, scope.row)">
                    {{ $t('common.delete') }}</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else-if="!loading" :image-size="100" :description="$t('componentList.list.emptyMsg')"></el-empty>
    </div>
    <ComponentEdit
      v-if="editingComponent"
      :component="editingComponent"
      @closed="dialogClosed"
      @saved="componentSaved" />
  </div>
</template>

<script>
import { componentApi } from '@/api/component.js'
import ComponentEdit from '@/components/component/ComponentEdit.vue'
import Avatar from '@/components/common/Avatar.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'ComponentList',
  components: { ComponentEdit, Avatar },
  data() {
    return {
      projectId: null,
      loading: true,
      tree: {},
      components: [],
      readonly: false,
      editingComponent: null,
      expandAll: false
    }
  },
  created() {
    this.projectId = this.$route.params.projectId
    this.loadComponents()
  },
  methods: {
    loadComponents() {
      this.loading = true
      componentApi.getTree(this.projectId).then((response) => {
        this.tree = response.data
        this.components = response.data?.children || []
        this.loading = false
      })
    },
    toggleExpandAll() {
      this.expandAll = !this.expandAll

      this.components.forEach((node) => {
        this.toggleExpand(node, this.expandAll)
      })
    },
    toggleExpand(node, expanded) {
      this.$refs['componentList'].toggleRowExpansion(node, expanded)

      if (node.children?.length) {
        node.children.forEach((child) => this.toggleExpand(child, expanded))
      }
    },
    create(parent) {
      if (parent?.id) {
        this.editingComponent = { projectId: this.projectId, parentId: parent.id }
      } else {
        this.editingComponent = { projectId: this.projectId }
      }
    },
    edit(row) {
      this.editingComponent = row
    },
    dialogClosed() {
      this.editingProject = null
    },
    del(index, row) {
      ElMessageBox.confirm(
        this.$t('componentList.msg.delConfirmMsg', { name: row.name }),
        this.$t('componentList.msg.delConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          componentApi.delete(row.id).then((res) => {
            this.removeFromTree(row)

            ElMessage.success({
              message: this.$t('componentList.msg.delSuccess', {
                name: row.name
              })
            })
          })
        })
        .catch((err) => {
          // Cancelled, do nothing
        })
    },
    removeFromTree(component) {
      let index = null

      if (!component.parentId) {
        index = this.components.findIndex((node) => node.id == component.id)
        this.components.splice(index, 1)
      } else {
        let parent = this.findFromTree(this.tree, component.parentId)
        index = parent.children.findIndex((node) => node.id == component.id)
        parent.children.splice(index, 1)
      }
    },
    componentSaved(component) {
      if (!component.parentId) {
        let index = this.components.findIndex((node) => node.id == component.id)

        if (index >= 0) {
          this.components.splice(index, 1, component)
        } else {
          this.components.push(component)
        }
      } else {
        let parent = this.findFromTree(this.tree, component.parentId)
        if (parent) {
          let index = parent.children.findIndex((node) => node.id == component.id)

          if (index >= 0) {
            parent.children.splice(index, 1, component)
          } else {
            parent.children.push(component)
          }
        } else {
          console.log('Cannot find component of ID ' + component.parentId)
        }
      }
    },
    dialogClosed() {
      this.editingComponent = null
    },
    findFromTree(component, id) {
      if (component.id == id) {
        return component
      } else if (component.children?.length) {
        let children = component.children
        let result = null

        children.some((child) => {
          result = this.findFromTree(child, id)
          if (result) {
            return true
          }
        })
        return result
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="less" scoped>
.component-tree-page {
  .header {
    height: 32px;
    margin: 10px 0 20px 0;
  }
}
</style>
