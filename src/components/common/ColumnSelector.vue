<template>
  <el-dropdown trigger="click" :teleported="false" :hide-on-click="false">
    <el-icon class="column-setting-btn"><Setting /></el-icon>
    <template #dropdown>
      <el-dropdown-menu>
        <div class="column-setting-menu-content">
          <div class="column-setting-header">
            <el-checkbox :model-value="isAllColumnsSelected" @change="toggleAllColumns">
              {{ $t('common.selectAll') }}
            </el-checkbox>
            <el-button type="primary" text link @click="restoreDefaultColumns">
              {{ $t('common.restoreDefault') }}
            </el-button>
          </div>
          <el-checkbox-group v-model="selectedColumns">
            <div v-for="item in availableColumns" :key="item.key">
              <el-checkbox :value="item.key" :disabled="item.readonly">
                {{ $t(item.labelKey) }}
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
export default {
  name: 'ColumnSelector',
  props: {
    availableColumns: {
      type: Array,
      required: true
    },
    modelValue: {
      type: Array,
      default: () => []
    },
    storeKey: {
      type: String,
      required: true
    }
  },
  emits: ['update:modelValue'],
  created() {
    this.persistColumns(this.modelValue)
  },
  computed: {
    selectedColumns: {
      get() {
        return this.normalizeColumns(this.modelValue)
      },
      set(columns) {
        this.persistColumns(columns)
      }
    },
    isAllColumnsSelected() {
      const currentColumns = this.selectedColumns
      return this.availableColumns.every((column) => currentColumns.includes(column.key))
    }
  },
  watch: {
    availableColumns: {
      handler() {
        this.persistColumns(this.modelValue)
      },
      deep: true
    }
  },
  methods: {
    getReadonlyColumns() {
      return this.availableColumns.filter((column) => column.readonly).map((column) => column.key)
    },
    getDefaultColumns() {
      return this.availableColumns.filter((column) => column.default || column.readonly).map((column) => column.key)
    },
    normalizeColumns(columns) {
      const requestedColumns = Array.isArray(columns) ? columns : []
      const availableColumnKeys = new Set(this.availableColumns.map((column) => column.key))
      const selectedColumns = new Set()

      requestedColumns.forEach((columnKey) => {
        if (availableColumnKeys.has(columnKey)) {
          selectedColumns.add(columnKey)
        }
      })

      this.getReadonlyColumns().forEach((columnKey) => selectedColumns.add(columnKey))

      if (selectedColumns.size === 0) {
        this.getDefaultColumns().forEach((columnKey) => selectedColumns.add(columnKey))
      }

      return this.availableColumns.map((column) => column.key).filter((columnKey) => selectedColumns.has(columnKey))
    },
    persistColumns(columns) {
      const normalizedColumns = this.normalizeColumns(columns)
      const currentColumns = Array.isArray(this.modelValue) ? this.modelValue : []
      const isSameColumns =
        currentColumns.length === normalizedColumns.length &&
        currentColumns.every((column, index) => column === normalizedColumns[index])
      if (isSameColumns) {
        return
      }

      this.$emit('update:modelValue', normalizedColumns)
      this.$store.set(this.storeKey, normalizedColumns)
    },
    toggleAllColumns(checked) {
      const allColumns = this.availableColumns.map((column) => column.key)
      const readonlyColumns = this.getReadonlyColumns()
      this.persistColumns(checked ? allColumns : readonlyColumns)
    },
    restoreDefaultColumns() {
      this.persistColumns(this.getDefaultColumns())
    }
  }
}
</script>

<style lang="less" scoped>
.column-setting-btn {
  margin-right: 16px;
  font-size: 15px;
  cursor: pointer;
  color: #999;
}

.column-setting-menu-content {
  padding: 8px 20px;
  min-width: 130px;
}

.column-setting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
</style>
