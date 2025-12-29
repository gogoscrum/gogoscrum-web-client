<template>
  <el-dialog
    v-model="visible"
    :title="$t('test.case.importDialog.title')"
    width="520px"
    :close-on-click-modal="false"
    :close-on-press-escape="!importing"
    :show-close="!importing"
    :destroy-on-close="true">
    <div class="import-dialog-content">
      <el-form class="import-form" label-position="left" label-width="100px">
        <el-form-item :label="$t('test.case.importDialog.fileLabel')">
          <el-upload
            ref="uploader"
            class="uploader"
            :auto-upload="false"
            :limit="1"
            :file-list="fileList"
            :disabled="importing"
            accept=".xls,.xlsx"
            :on-change="onFileChange"
            :on-remove="onFileRemove"
            :on-exceed="onFileExceed">
            <el-button type="primary">
              {{ $t('test.case.importDialog.chooseFile') }}
            </el-button>
          </el-upload>
          <div class="form-field-tip">
            <span>{{ $t('test.case.importDialog.tip') }}</span>
            <a @click="downloadTemplate" class="font-bold ml-2">
              {{ $t('test.case.importDialog.downloadTemplate') }}
            </a>
          </div>
        </el-form-item>

        <el-form-item v-if="importing || importDone > 0" :label="$t('test.case.importDialog.progress')">
          <div class="flex-1">
            <el-progress :percentage="progressPercent" :status="progressStatus" />
            <div class="progress-text">
              {{ importDone }} / {{ importTotal }}
              <span v-if="importMessage" class="ml-2">{{ importMessage }}</span>
            </div>
          </div>
        </el-form-item>

        <el-form-item v-if="validationErrors.length" :label="$t('test.case.importDialog.validationErrors')">
          <div class="validation-list">
            <div class="validation-summary">
              {{ $t('test.case.importDialog.validationErrorsTitle', { count: validationErrors.length }) }}
            </div>
            <div v-for="(err, idx) in validationErrors" :key="idx" class="validation-error-item">
              {{ $t('test.case.importDialog.row') }} {{ err.rowNumber }}: {{ err.message }}
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <el-button :disabled="importing" @click="visible = false">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="importing" :disabled="!selectedFile || importing" @click="startImport">
        {{ $t('test.case.importDialog.import') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import * as XLSX from 'xlsx'
import { testCaseApi } from '@/api/testing.js'
import { componentApi } from '@/api/component.js'
import { ElMessage } from 'element-plus'
import dict from '@/locales/zh-cn/dict.json'

export default {
  name: 'TestCaseImporter',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: [String, Number],
      default: null
    }
  },
  emits: ['update:modelValue', 'imported'],
  computed: {
    visible: {
      get() {
        return this.modelValue
      },
      set(v) {
        this.$emit('update:modelValue', v)
      }
    },
    progressPercent() {
      if (!this.importTotal) return 0
      return Math.min(100, Math.round((this.importDone / this.importTotal) * 100))
    },
    progressStatus() {
      if (this.importError) return 'exception'
      if (this.importTotal > 0 && this.importDone >= this.importTotal) return 'success'
      return undefined
    }
  },
  data() {
    return {
      templateBaseUrl: `${import.meta.env.BASE_URL}templates/`,
      fileList: [],
      selectedFile: null,
      importing: false,
      importTotal: 0,
      importDone: 0,
      importMessage: '',
      importError: null,
      validationErrors: []
    }
  },
  watch: {
    modelValue(val) {
      // When dialog is closed, reset state
      if (!val) {
        this.resetState()
      }
    }
  },
  methods: {
    downloadTemplate() {
      // UI-only: template is served as a static asset from /public
      const lang = localStorage.getItem('locale') || 'en'
      const suffix = lang === 'cn' ? 'CN' : 'EN'
      const filename = `test-case-import-template-${suffix}.xlsx`
      const link = document.createElement('a')
      link.href = `${this.templateBaseUrl}${filename}`
      link.download = filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    onFileChange(uploadFile, uploadFiles) {
      // Always replace previous selection with the latest file
      const file = uploadFile || uploadFiles?.[uploadFiles.length - 1]
      this.fileList = file ? [file] : []
      this.selectedFile = file?.raw || null

      // Clear previous validation results when switching files
      this.validationErrors = []
    },
    onFileRemove() {
      this.fileList = []
      this.selectedFile = null

      this.validationErrors = []
    },
    onFileExceed(files) {
      // When user selects a new file while one already exists, silently replace it.
      this.$refs.uploader?.clearFiles?.()
      const file = files?.[0]
      if (!file) return
      this.fileList = [{ name: file.name, raw: file }]
      this.selectedFile = file

      this.validationErrors = []
    },
    resetState() {
      this.fileList = []
      this.selectedFile = null
      this.importing = false
      this.importTotal = 0
      this.importDone = 0
      this.importMessage = ''
      this.importError = null
      this.validationErrors = []
    },
    normalizeEnum(value, allowedValues, fallback = null) {
      if (value === null || value === undefined) return fallback
      const text = String(value).trim()
      if (!text) return fallback
      const upper = text.toUpperCase()
      return allowedValues.includes(upper) ? upper : fallback
    },
    parseBoolean(value, fallback = false) {
      if (typeof value === 'boolean') return value
      if (value === null || value === undefined) return fallback
      const text = String(value).trim().toLowerCase()
      if (!text) return fallback
      return ['true', '1', 'yes', 'y', 'on', '是', '对', '√'].includes(text)
    },
    parseStepsCell(stepsCell) {
      const text = stepsCell === null || stepsCell === undefined ? '' : String(stepsCell)
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
      return lines.map((line) => {
        const noIndex = line.replace(/^\s*\d+\s*[\.|、|)]\s*/, '')
        const parts = noIndex.split(/\s*->\s*/)
        const description = (parts[0] || '').trim()
        const expectation = (parts[1] || '').trim()
        return { description, expectation }
      })
    },
    async buildComponentNameMap() {
      try {
        const res = await componentApi.getAll(this.projectId)
        const components = res?.data || []
        const map = new Map()
        components.forEach((c) => {
          if (c?.name && c?.id != null) {
            map.set(String(c.name).trim().toLowerCase(), c.id)
          }
        })
        return map
      } catch (e) {
        return new Map()
      }
    },
    buildMemberNameMap() {
      const project = this.$store?.get('project')
      const members = project?.projectMembers || []
      const map = new Map()
      members.forEach((m) => {
        const nick = m?.user?.nickname
        const id = m?.user?.id
        if (nick && id != null) {
          map.set(String(nick).trim().toLowerCase(), id)
        }
      })
      return map
    },
    async parseExcelFile(file) {
      // Column order based on public/templates/testcase-import-template-EN.xlsx
      // [0] Title, [1] Type, [2] Priority, [3] Component, [4] Preconditions,
      // [5] Steps, [6] Owner, [7] Automation, [8] Description
      const [buffer, componentMap] = await Promise.all([file.arrayBuffer(), this.buildComponentNameMap()])
      // SheetJS expects a Uint8Array when using { type: 'array' } in browser.
      // Passing ArrayBuffer directly can lead to it being misinterpreted.
      const data = new Uint8Array(buffer)

      const wb = XLSX.read(data, { type: 'array' })
      if (!wb?.SheetNames?.length) {
        throw new Error('Empty workbook')
      }
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
      const memberMap = this.buildMemberNameMap()

      const allowedTypes = Object.keys(dict.testTypes)
      const allowedPriorities = Object.keys(dict.issuePriorities)

      const results = []
      const errors = []
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i] || []
        const rowNumber = i + 1 // 1-based Excel row number

        const rowHasAnyValue = row.some((c) => String(c ?? '').trim() !== '')
        if (!rowHasAnyValue) continue

        const name = String(row[0] ?? '').trim()

        const nameLower = name.toLowerCase()
        // Ignore any template note rows at the bottom (or user-added notes)
        if (
          nameLower.startsWith('notes') ||
          nameLower.includes('do not import') ||
          nameLower.startsWith('remark') ||
          name.startsWith('备注')
        ) {
          continue
        }

        const rowErrors = []
        // Template notes define Title as required; other columns are optional.
        if (!name) {
          rowErrors.push(this.$t('test.case.importDialog.titleRequired'))
        }

        const rawType = String(row[1] ?? '').trim()
        const type = this.normalizeEnum(rawType, allowedTypes, null)
        if (rawType && !type) {
          rowErrors.push(this.$t('test.case.importDialog.invalidType', { value: rawType }))
        }

        const rawPriority = String(row[2] ?? '').trim()
        const priorityNormalized = this.normalizeEnum(rawPriority, allowedPriorities, null)
        if (rawPriority && !priorityNormalized) {
          rowErrors.push(this.$t('test.case.importDialog.invalidPriority', { value: rawPriority }))
        }
        const priority = rawPriority ? priorityNormalized : 'NORMAL'

        const componentName = String(row[3] ?? '').trim()
        const componentId = componentName ? componentMap.get(componentName.toLowerCase()) : null
        if (componentName && componentId == null) {
          rowErrors.push(this.$t('test.case.importDialog.componentNotFound', { value: componentName }))
        }

        const preconditions = String(row[4] ?? '').trim()
        const steps = this.parseStepsCell(row[5])

        const ownerName = String(row[6] ?? '').trim()
        const ownerId = ownerName ? memberMap.get(ownerName.toLowerCase()) : null
        if (ownerName && ownerId == null) {
          rowErrors.push(this.$t('test.case.importDialog.ownerNotFound', { value: ownerName }))
        }

        const automated = this.parseBoolean(row[7], false)
        const description = String(row[8] ?? '').trim()

        if (rowErrors.length) {
          errors.push({ rowNumber, message: rowErrors.join('; ') })
          continue
        }

        const details = {
          name,
          type,
          priority,
          componentId: componentId ?? null,
          preconditions,
          steps,
          owner: ownerId != null ? { id: ownerId } : null,
          automated,
          description
        }

        // Remove null enum fields to keep payload clean
        if (!details.type) delete details.type
        if (!details.componentId) delete details.componentId
        if (!details.owner) delete details.owner

        results.push({ projectId: this.projectId, details })
      }

      return { testCases: results, errors }
    },
    async startImport() {
      if (!this.selectedFile || this.importing) return
      if (!this.projectId) {
        ElMessage.error(this.$t('test.case.importDialog.missingProject'))
        return
      }

      this.importing = true
      this.importError = null
      this.validationErrors = []
      this.importDone = 0
      this.importTotal = 0
      this.importMessage = this.$t('test.case.importDialog.parsing')

      try {
        const parsed = await this.parseExcelFile(this.selectedFile)
        const testCases = parsed?.testCases || []
        const errors = parsed?.errors || []
        this.validationErrors = errors
        if (errors.length) {
          this.importMessage = ''
          this.importTotal = 0
          this.importDone = 0
          this.importing = false
          return
        }

        this.importTotal = testCases.length

        if (!this.importTotal) {
          ElMessage.warning(this.$t('test.case.importDialog.noData'))
          this.importMessage = ''
          this.importing = false
          return
        }

        this.importMessage = this.$t('test.case.importDialog.importing')
        const batchSize = 10
        for (let i = 0; i < testCases.length; i += batchSize) {
          const batch = testCases.slice(i, i + batchSize)
          await testCaseApi.createAll(batch)
          this.importDone = Math.min(testCases.length, i + batch.length)
        }

        this.importMessage = this.$t('test.case.importDialog.done')
        ElMessage.success(this.$t('test.case.importDialog.success'))
        this.$emit('imported')
        this.visible = false
      } catch (e) {
        this.importError = e
        this.importMessage = this.$t('test.case.importDialog.failed')
        const msg = e?.response?.data?.message || e?.message || this.$t('common.msg.formValidationFail')
        ElMessage.error(msg)
      } finally {
        this.importing = false
      }
    }
  }
}
</script>

<style lang="less" scoped>
.import-dialog-content {
  .uploader {
    width: 100%;
  }

  .progress-text {
    margin-top: 6px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  .validation-list {
    max-height: 200px;
    overflow-y: auto;
  }

  .validation-summary {
    font-size: 12px;
    font-weight: 500;
  }

  .validation-error-item {
    padding: 4px 0;
    color: var(--el-color-danger);
    font-size: 12px;
    line-height: 1.4;
    word-break: break-word;
  }
}
</style>
