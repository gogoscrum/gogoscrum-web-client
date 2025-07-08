<template>
  <div>
    <el-dialog
      v-model="dialogVisible"
      :width="dialogWidth"
      :append-to-body="true"
      :top="`${editIssueId ? '5vh' : '15vh'}`"
      :fullscreen="isInMobile"
      :draggable="true"
      class="issue-edit-dialog"
      @close="issueDialogClosed">
      <template #header>
        <div v-if="editIssue.id" class="header-issue-code">
          <issue-type-icon :type="editIssue.type" />
          <span class="issue-code">{{ editIssue.code }}</span>
          <el-button
            class="header-btn"
            size="small"
            text
            round
            icon="CopyDocument"
            :title="$t('issueEdit.copyCode')"
            @click="copyIssueCode">
          </el-button>
          <el-button
            class="header-btn"
            size="small"
            text
            round
            icon="Refresh"
            :title="$t('common.refresh')"
            @click="refreshIssue">
          </el-button>
        </div>
        <span v-else class="el-dialog__title">{{
          editIssueId ? $t('issueEdit.titleEdit') : $t('issueEdit.titleNew')
        }}</span>
      </template>
      <el-form
        :model="editIssue"
        :rules="issueFormRules"
        v-loading="loading"
        ref="issueFormRef"
        label-width="98px"
        class="light-form">
        <el-form-item prop="name" label-width="0">
          <el-input
            v-model="editIssue.name"
            ref="issueNameInput"
            :placeholder="$t('issueEdit.namePlaceholder')"
            :autosize="{ minRows: 1 }"
            maxlength="500"
            type="textarea"
            resize="none"
            class="issue-title-input"></el-input>
        </el-form-item>
        <el-form-item :label="$t('issueEdit.remark')" prop="description" class="desc-row">
          <div v-if="editIssue.description?.length && !editingDesc" class="flex relative">
            <vue-markdown
              :options="{ html: true, linkify: true, breaks: true }"
              :source="editIssue.description"
              class="desc-md" />
            <div class="action-btn flex items-center" @click="editDesc">
              <el-icon class="mr-1"><Edit /></el-icon>
              {{ $t('common.edit') }}
            </div>
          </div>
          <template v-else>
            <el-input
              ref="issueDescInput"
              v-model="editIssue.description"
              :placeholder="$t('issueEdit.remarkPlaceholder')"
              :autosize="{ minRows: 1 }"
              maxlength="1000"
              type="textarea"
              resize="none"
              @focus="editingDesc = true"
              @blur="editingDesc = false"></el-input>
            <div v-if="editingDesc" class="form-field-tip w-full">
              {{ $t('issueEdit.markdownSupported') }}
            </div>
          </template>
        </el-form-item>
        <el-row v-if="editIssueId">
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('issueEdit.createdBy')">
              <member-selector
                v-model="editIssue.createdBy"
                :members="project.projectMembers"
                :disabled="true"
                :filterable="true"></member-selector>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('issueEdit.createdTime')">
              <span class="ml-3">{{ editIssue.createdTimeFormatted || editIssue.createdTime }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('issueEdit.issueType')" prop="type">
              <issue-type-selector
                v-model="editIssue.type"
                :placeholder="$t('issueEdit.issueTypePlaceholder')"></issue-type-selector>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('issueEdit.sprint')">
              <el-select v-model="editIssue.sprint" :placeholder="$t('issueEdit.sprintPlaceholder')" value-key="id">
                <el-option v-for="sprint in project.sprints" :key="sprint.id" :label="sprint.name" :value="sprint">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('issueEdit.priority')">
              <priority-selector
                v-model="editIssue.priority"
                :placeholder="$t('issueEdit.priorityPlaceholder')"></priority-selector>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('issueEdit.status')">
              <el-select v-model="editIssue.issueGroup" value-key="id" :placeholder="$t('issueEdit.statusPlaceholder')">
                <template #label>
                  <status-tag :status="editIssue.issueGroup?.status" :label="editIssue.issueGroup?.label" />
                </template>
                <el-option
                  v-for="group in issueGroups"
                  :key="group.id"
                  :label="group.label"
                  :value="group"
                  class="issue-group-option">
                  <status-tag :status="group.status" :label="group.label" />
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('issueEdit.assignee')">
              <member-selector
                v-model="editIssue.owner"
                :placeholder="$t('issueEdit.assigneePlaceholder')"
                :members="project.projectMembers"
                :clearable="true"></member-selector>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('issueEdit.storyPoints')">
              <el-select
                v-model="editIssue.storyPoints"
                :placeholder="$t('issueEdit.storyPointsPlaceholder')"
                clearable>
                <el-option v-for="storyPoint in storyPoints" :key="storyPoint" :value="storyPoint"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row v-if="project.timeTrackingEnabled">
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('issueEdit.estimatedHours')" prop="estimatedHours">
              <el-input
                v-model="editIssue.estimatedHours"
                clearable
                maxlength="6"
                :placeholder="$t('issueEdit.hoursPlaceholder')"></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('issueEdit.actualHours')" prop="actualHours">
              <el-input
                v-model="editIssue.actualHours"
                clearable
                maxlength="6"
                :placeholder="$t('issueEdit.hoursPlaceholder')"></el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('issueEdit.component')">
              <el-cascader
                v-model="editIssue.componentId"
                :options="components"
                :props="componentProps"
                clearable
                :show-all-levels="false"
                :placeholder="$t('issueEdit.componentPlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12">
            <el-form-item :label="$t('issueEdit.dueTime')">
              <el-date-picker
                v-model="editIssue.dueTime"
                type="datetime"
                :placeholder="$t('issueEdit.dueTimePlaceholder')"
                :default-time="defaultTime"
                format="YYYY-MM-DD HH:mm">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-form-item :label="$t('issueEdit.tag')">
            <div class="tag-container">
              <el-tag
                v-for="(tag, tagIndex) in editIssue.tags"
                :key="tag.id"
                :color="tag.color || '#999999'"
                effect="dark"
                size="small"
                class="tag-item no-border">
                <span>{{ tag.name }}</span>
                <el-icon class="del-icon" @click="delTag(tagIndex)"><Close /></el-icon>
              </el-tag>

              <el-popover placement="bottom-start" width="250" trigger="click" popper-class="tag-select-popover">
                <div>
                  <div v-for="tag in tags" :key="tag.id" class="tag-row" @click="toggleTag(tag)">
                    <el-tag
                      :color="tag.color || '#999999'"
                      effect="dark"
                      size="small"
                      class="no-border tag-option-item"
                      >{{ tag.name }}</el-tag
                    >
                    <el-icon v-if="isTagChecked(tag)" class="tag-checked"><Check /></el-icon>
                  </div>
                  <div class="tag-row" @click="newTag()">
                    {{ $t('issueEdit.newTag') }}
                  </div>
                </div>
                <template #reference>
                  <el-button icon="Plus" circle></el-button>
                </template>
              </el-popover>
            </div>
          </el-form-item>
        </el-row>
        <el-form-item v-if="editIssueId" :label="$t('issueEdit.files')">
          <div class="issue-img-list">
            <template v-for="(file, index) in editIssue.files" :key="file.id">
              <div class="issue-img-item">
                <el-tooltip :content="file.name" placement="bottom">
                  <el-image
                    v-if="file.type === 'IMAGE'"
                    :src="file.url"
                    :preview-teleported="true"
                    :preview-src-list="imgPreviewSrcList"
                    :initial-index="index"
                    :hide-on-click-modal="true"
                    :z-index="9999"
                    class="issue-img" />
                  <a v-else @click="fileClicked(file)"><file-icon :type="file.type" class="issue-img" /></a>
                </el-tooltip>
                <el-icon
                  class="img-action-icon delete-img-icon"
                  :title="$t('common.delete')"
                  @click="deleteFile(index, file)">
                  <Delete />
                </el-icon>
                <el-icon
                  class="img-action-icon download-img-icon"
                  :title="$t('common.download')"
                  @click="downloadFile(file)">
                  <Download />
                </el-icon>
              </div>
            </template>
            <div
              v-if="project.isDeveloper"
              @mouseenter="mouseEnterUploaderBox"
              @mouseleave="mouseLeaveUploaderBox"
              @dragover.native="dragoverUploaderBox">
              <el-tooltip
                v-if="waitingPasteFile"
                :content="$t('issueEdit.uploaderPasteHere', { ctrlKey: ctrlKey })"
                placement="top">
                <input
                  v-loading="uploading"
                  ref="filePasteInput"
                  v-model="filePasteInputValue"
                  class="file-paste-input"
                  @paste="handleFilePasteEvent"
                  @blur="hideFilePasteInput" />
              </el-tooltip>
              <el-tooltip v-else :content="$t('issueEdit.uploaderPlacehoder')" placement="top">
                <el-upload
                  v-loading="uploading"
                  :action="uploadParams.uploadActionUrl"
                  drag
                  :before-upload="initUploadParams"
                  :data="uploadParams"
                  :on-exceed="onExceed"
                  :on-error="imgUploadError"
                  :on-success="imgUploadSuccess"
                  :show-file-list="false"
                  :multiple="true"
                  :limit="5"
                  @click.native="hideFilePasteInput"
                  class="file-uploader">
                  <el-icon><Plus /></el-icon>
                </el-upload>
              </el-tooltip>
            </div>
          </div>
          <div class="form-field-tip w-full">
            {{ $t('issueEdit.uploaderFieldTip') }}
          </div>
        </el-form-item>

        <el-form-item v-if="editIssueId" :label="$t('issueEdit.links')" class="link-issue">
          <div class="flex justify-end w-full">
            <div v-if="project.isDeveloper" class="action-btn flex items-center" @click="addIssueLinkClicked()">
              <el-icon class="mr-1"><Plus /></el-icon>
              {{ $t('issueEdit.addLink') }}
            </div>
          </div>
        </el-form-item>
        <el-table :data="linkedIssues" :show-header="false" v-if="linkedIssues.length" class="link-issue-table">
          <el-table-column prop="code" min-width="200px">
            <template #default="scope">
              <div class="issue-item-row">
                <issue-type-icon :type="scope.row.type" />
                <div class="issue-code-name" @click="showLinkedIssue(scope.row)">
                  <div class="code">{{ scope.row.code }}</div>
                  <el-tooltip
                    placement="bottom"
                    width="300"
                    :content="scope.row.name"
                    popper-class="issue-full-name-tooltip">
                    <div class="name">{{ scope.row.name }}</div>
                  </el-tooltip>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="16px">
            <template #default="scope">
              <priority-icon :priority="scope.row.priority" />
            </template>
          </el-table-column>
          <el-table-column prop="issueGroup.label" min-width="60px">
            <template #default="scope">
              <status-tag
                v-if="scope.row.issueGroup"
                :status="scope.row.issueGroup.status"
                :label="scope.row.issueGroup.label" />
            </template>
          </el-table-column>
          <el-table-column min-width="25px">
            <template #default="scope">
              <div class="flex">
                <el-tooltip
                  v-if="scope.row.owner?.nickname"
                  :content="$t('issueRow.assignee', { assignee: scope.row.owner.nickname })"
                  placement="bottom">
                  <avatar
                    :name="scope.row.owner.nickname"
                    :size="22"
                    :src="scope.row.owner.avatarUrl"
                    inline
                    class="m-auto"></avatar>
                </el-tooltip>
              </div>
            </template>
          </el-table-column>
          <el-table-column min-width="15px">
            <template #default="scope">
              <el-icon class="delete-icon" @click.stop="unlinkIssue(scope.row)" :title="$t('issueEdit.delLink')">
                <Delete />
              </el-icon>
            </template>
          </el-table-column>
        </el-table>
        <el-select
          id="issueSelector"
          @click.native="searchAllIssue"
          v-if="issueSelectorVisible"
          filterable
          remote
          v-model="selectedIssue"
          value-key="id"
          :fit-input-width="true"
          :placeholder="$t('issueEdit.issueSelectorPlaceholder')"
          :no-match-text="$t('issueEdit.issueSelectorNoMatch')"
          :no-data-text="$t('issueEdit.issueSelectorNoMatch')"
          :remote-method="searchIssue"
          @change="linkIssue"
          @blur="issueSearcherClose">
          <el-option v-for="item in issueSelectResult" :key="item.id" :value="item.id" class="issue-selector">
            <div class="issue-item-row">
              <issue-type-icon :type="item.type" />
              <div class="code">{{ item.code }}</div>
              <div class="name">{{ item.name }}</div>
            </div></el-option
          >
        </el-select>

        <el-tabs v-if="editIssueId" v-model="activeTab" type="card" @tab-change="tabClicked">
          <el-tab-pane :label="$t('issueEdit.comments')" name="comments">
            <template #label>
              <div class="flex items-center">
                <el-icon class="text-base mr-1"><ChatDotSquare /></el-icon> {{ $t('issueEdit.comments') }}
              </div>
            </template>
            <div v-if="editIssue.comments && editIssue.comments.length" class="comments-list">
              <el-timeline :reverse="false">
                <el-timeline-item
                  v-for="(comment, index) in editIssue.comments"
                  :key="comment.id"
                  :timestamp="`${comment.createdTime} ${comment.createdBy.nickname}`"
                  placement="top">
                  <template #dot>
                    <el-tooltip :content="comment.createdBy.nickname" placement="left">
                      <avatar :name="comment.createdBy.nickname" :size="22" :src="comment.createdBy.avatarUrl"></avatar>
                    </el-tooltip>
                  </template>
                  <div>
                    <div>
                      <span>{{ comment.content }}</span>
                    </div>
                    <div v-if="currentUser.id == comment.createdBy.id" class="comment-item-actions">
                      <el-icon :title="$t('common.edit')" @click="editComment(index)"><Edit /></el-icon>
                      <el-icon :title="$t('common.delete')" @click="deleteComment(index)"><Delete /></el-icon>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
            <div v-if="showCommentInput">
              <el-input
                id="commentEditingTextArea"
                v-model="commentContent"
                :placeholder="$t('issueEdit.commentPlaceholder')"
                :autosize="{ minRows: 1 }"
                maxlength="500"
                clearable
                type="textarea"
                resize="none"
                autofocus
                @keydown.ctrl.enter="commentChanged"></el-input>
            </div>
            <template v-if="project.isDeveloper">
              <div v-if="showCommentInput" id="issueCommentInputField" class="flex-row justify-content-space-between">
                <div class="form-field-tip submit-comment-shortcut">
                  {{ $t('issueEdit.ctrlEnter') }}
                </div>
                <div class="flex-row">
                  <div class="action-btn" @click="cancelEditComment">
                    {{ $t('common.cancel') }}
                  </div>
                  <div class="action-btn" @click="saveComment">
                    {{ $t('common.save') }}
                  </div>
                </div>
              </div>
              <div v-else class="comment-action-btns">
                <div class="action-btn flex items-center" @click="newComment">
                  <el-icon class="mr-1"><Plus /></el-icon>
                  {{ $t('issueEdit.addComment') }}
                </div>
              </div>
            </template>
          </el-tab-pane>
          <el-tab-pane :label="$t('issueEdit.history')" name="history">
            <template #label>
              <div class="flex items-center">
                <el-icon class="ext-base mr-1"><Clock /></el-icon>{{ $t('issueEdit.history') }}
              </div>
            </template>

            <div v-if="histories && histories.length" v-infinite-scroll="loadIssueHistories" class="comments-list">
              <el-timeline :reverse="true">
                <el-timeline-item
                  v-for="history in histories"
                  :key="history.id"
                  :timestamp="`${history.createdTime} ${history.createdBy.nickname}`"
                  placement="top">
                  <template #dot>
                    <el-tooltip :content="history.createdBy.nickname" placement="left">
                      <avatar :name="history.createdBy.nickname" :size="22" :src="history.createdBy.avatarUrl"></avatar>
                    </el-tooltip>
                  </template>
                  <div>
                    <div>
                      <span>{{ $t(`historyActionTypes.${history.actionType}`) }}</span>
                    </div>
                    <div class="comment-item-actions">
                      <el-popover placement="top-end" trigger="hover" popper-class="history-details-popover">
                        <div v-html="history.details"></div>
                        <template #reference>
                          <div class="show-history-details">
                            <el-icon class="mr-3px"><ZoomIn /></el-icon>
                            <div>{{ $t('issueEdit.details') }}</div>
                          </div>
                        </template>
                      </el-popover>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <el-button
          v-if="editIssueId"
          :loading="deleting"
          type="danger"
          icon="Delete"
          class="btn-delete-issue no-border"
          size="default"
          plain
          @click="deleteIssue"
          :disabled="!project.isDeveloper">
          {{ $t('common.delete') }}
        </el-button>
        <el-button size="default" class="no-border" @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button
          :disabled="!project.isDeveloper"
          :loading="saving"
          size="default"
          type="primary"
          class="no-border"
          @click="saveIssue">
          {{ $t('common.save') }}
        </el-button>
      </template>
    </el-dialog>
    <issue-edit
      v-if="showLinkedIssueDialog"
      :editIssueId="linkedIssueInfo.id"
      :projectId="projectId"
      @issueFormClosed="issueFormClosed"
      @onIssueUpdated="issueUpdated"
      @onIssueDeleted="issueDeleted"
      @onIssueLinked="issueLinked"
      @onIssueUnlinked="issueUnlinked" />
    <tag-edit v-if="editingTag" :projectId="projectId" @tagFormClosed="tagDialogClosed" @tagSaved="tagSaved" />
    <el-dialog
      v-if="videoPlaying"
      v-model="videoDialogVisible"
      :title="videoPlaying?.name"
      draggable
      align-center
      width="680px"
      class="video-preview-dialog"
      @close="videoPlaying = null">
      <video v-if="videoPlaying.type == 'VIDEO'" :src="videoPlaying.url" controls class="w-full"></video>
      <audio v-else-if="videoPlaying.type == 'AUDIO'" :src="videoPlaying.url" controls class="w-full"></audio>
    </el-dialog>
    <OfficeViewer v-if="officeFile" :file="officeFile" @close="officeFile = null" />
    <PdfViewer v-if="pdfFile" :file="pdfFile" @close="pdfFile = null" />
  </div>
</template>

<script>
import { fileApi } from '@/api/file.js'
import { issueApi } from '@/api/issue.js'
import { commentApi } from '@/api/comment.js'
import { projectApi } from '@/api/project.js'
import { tagApi } from '@/api/tag.js'
import { componentApi } from '@/api/component.js'
import uploader from '@/utils/uploader.js'
import utils from '@/utils/util.js'
import Avatar from '@/components/common/Avatar.vue'
import FileIcon from '@/components/common/FileIcon.vue'
import IssueTypeIcon from '@/components/common/IssueTypeIcon.vue'
import IssueTypeSelector from '@/components/common/IssueTypeSelector.vue'
import PrioritySelector from '@/components/common/PrioritySelector.vue'
import PriorityIcon from '@/components/common/PriorityIcon.vue'
import MemberSelector from '@/components/common/MemberSelector.vue'
import OfficeViewer from '@/components/common/OfficeViewer.vue'
import PdfViewer from '@/components/common/PdfViewer.vue'
import TagEdit from '@/components/tag/TagEdit.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import VueMarkdown from 'vue-markdown-render'
import { ElMessageBox, ElMessage } from 'element-plus'
export default {
  name: 'IssueEdit',
  components: {
    Avatar,
    IssueTypeSelector,
    PrioritySelector,
    MemberSelector,
    FileIcon,
    IssueTypeIcon,
    TagEdit,
    StatusTag,
    PriorityIcon,
    OfficeViewer,
    PdfViewer,
    VueMarkdown
  },
  props: {
    editIssueId: {
      type: String,
      default: () => {
        return ''
      }
    },
    projectId: {
      type: String,
      default: () => {
        return ''
      }
    }
  },
  data() {
    const validateHours = (rule, value, callback) => {
      if (value && isNaN(value)) {
        callback(new Error(this.$t('issueEdit.msg.invalidHours')))
      } else {
        callback()
      }
    }

    return {
      isInMobile: utils.isInMobile(),
      currentUser: {},
      dialogVisible: true,
      uploadParams: {},
      loading: false,
      uploading: false,
      filePasteInputValue: '',
      saving: false,
      deleting: false,
      editIssue: {
        changed: false,
        tags: [],
        files: [],
        projectId: this.projectId
      },
      project: {},
      tags: [],
      storyPoints: [0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 90, 100],
      issueFormRules: {
        name: [
          {
            required: true,
            message: this.$t('issueEdit.msg.missingName'),
            trigger: 'blur'
          },
          {
            min: 1,
            max: 500,
            message: this.$t('issueEdit.msg.invalidName'),
            trigger: 'blur'
          }
        ],
        estimatedHours: [{ validator: validateHours, trigger: 'blur' }],
        actualHours: [{ validator: validateHours, trigger: 'blur' }]
      },
      imgPreviewSrcList: [],
      showCommentInput: false,
      editingDesc: false,
      editingComment: null,
      commentContent: '',
      issueGroups: [],
      activeTab: 'comments',
      histories: [],
      historyPage: 0,
      historyTotalPages: null,
      issueSelectResult: [],
      selectedIssue: {},
      linkedIssues: [],
      issueFilter: {
        projectId: this.projectId,
        keyword: null,
        orders: [{ property: 'code' }]
      },
      issueSelectorVisible: false,
      linkedIssueInfo: {},
      showLinkedIssueDialog: false,
      waitingPasteFile: false,
      editingTag: false,
      defaultTime: new Date(0, 0, 0, 23, 59, 59),
      ctrlKey: utils.getCtrlKey(),
      components: [],
      componentProps: {
        label: 'name',
        value: 'id',
        multiple: false,
        emitPath: false,
        expandTrigger: 'hover',
        checkStrictly: true
      },
      videoPlaying: null,
      videoDialogVisible: false,
      officeFile: null,
      pdfFile: null
    }
  },
  computed: {
    dialogWidth() {
      console.log('window.innerWidth', window.innerWidth)
      if (window.innerWidth > 1440) {
        return '860px'
      } else {
        return '720px'
      }
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.currentUser = this.$store.get('user')
      if (this.editIssueId) {
        this.loadIssue()
      } else {
        this.editIssue.type = 'TASK'
        setTimeout(() => {
          this.$refs.issueNameInput.focus()
        }, 100)
      }
      this.initProject()
      this.loadTags()
      this.loadComponents()
    },
    loadIssue() {
      issueApi.getById(this.editIssueId).then((res) => {
        this.editIssue = this.formatIssue(res.data)
        this.linkedIssues = this.editIssue.linkToIssues.concat(this.editIssue.linkedByIssues)
        this.initImgPreviewSrcList()
      })
    },
    formatIssue(issue) {
      return utils.formatCreateUpdateTime(issue)
    },
    loadComponents() {
      componentApi.getTree(this.projectId).then((response) => {
        this.components = response.data?.children || []
      })
    },
    initProject() {
      if (this.projectId != null) {
        projectApi.getById(this.projectId).then((res) => {
          this.project = res.data
          this.issueGroups = this.project.issueGroups
          let projectMember = this.project.projectMembers.filter((member) => member.user.id == this.currentUser.id)[0]
          if (projectMember.role == 'OWNER' || projectMember.role == 'DEVELOPER') {
            this.project.isDeveloper = true
          }
        })
      }
    },
    copyIssueCode() {
      navigator.clipboard.writeText(this.editIssue.code).then(() => {
        ElMessage.success({
          message: this.$t('issueEdit.msg.issueCodeCopied')
        })
      })
    },
    refreshIssue() {
      this.loading = true
      this.init()
      setTimeout(() => {
        this.loading = false
      }, 300)
    },
    initImgPreviewSrcList() {
      this.imgPreviewSrcList = []
      if (this.editIssue.files && this.editIssue.files.length) {
        this.editIssue.files.forEach((file) => {
          if (file.type === 'IMAGE') {
            this.imgPreviewSrcList.push(file.url)
          }
        })
      }
    },
    loadTags(keyword) {
      if (this.projectId != null) {
        tagApi.search({ projectId: this.projectId, keyword: keyword, pageSize: 100 }).then((res) => {
          this.tags = res.data.results
        })
      }
    },
    editDesc() {
      this.editingDesc = true
      this.$nextTick(() => {
        document.querySelector('.issue-title-input').scrollIntoView({ behavior: 'smooth' })
        setTimeout(() => {
          this.$refs.issueDescInput.focus()
        }, 500)
      })
    },
    newTag() {
      this.editingTag = true
    },
    tagSaved(tag) {
      this.editIssue.tags.push(tag)
      this.loadTags()
    },
    tagDialogClosed() {
      this.editingTag = false
    },
    delTag(index) {
      this.editIssue.tags.splice(index, 1)
    },
    isTagChecked(tag) {
      let index = utils.indexInArray(this.editIssue.tags, tag.id)

      return index >= 0
    },
    toggleTag(tag) {
      let index = utils.indexInArray(this.editIssue.tags, tag.id)

      if (index >= 0) {
        this.editIssue.tags.splice(index, 1)
      } else {
        this.editIssue.tags.push(tag)
      }
    },
    mouseEnterUploaderBox() {
      this.waitingPasteFileTimeout = setTimeout(() => {
        this.waitingPasteFile = true
        this.$nextTick(() => {
          this.$refs.filePasteInput.focus()
          this.filePasteInputValue = ''
        })
      }, 1500)
    },
    mouseLeaveUploaderBox() {
      if (!this.waitingPasteFile) {
        this.hideFilePasteInput()
      }
    },
    dragoverUploaderBox() {
      setTimeout(() => {
        this.hideFilePasteInput()
      }, 200)
    },
    hideFilePasteInput() {
      this.waitingPasteFile = false
      clearTimeout(this.waitingPasteFileTimeout)
    },
    fileClicked(file) {
      if (file.type == 'VIDEO' || file.type == 'AUDIO') {
        this.videoPlaying = file
        this.videoDialogVisible = true
      } else if (file.type == 'WORD' || file.type == 'PPT' || file.type == 'EXCEL') {
        if (file.url.startsWith('http')) {
          this.officeFile = file
        } else {
          this.downloadFile(file)
          console.warn('Office file URL is not valid, downloading instead:', file.url)
        }
      } else if (file.type == 'PDF') {
        this.pdfFile = file
      } else {
        this.downloadFile(file)
      }
    },
    downloadFile(file) {
      fileApi.getFileBlob(file.url).then((res) => {
        utils.downloadFile(res.data, file.name)
      })
    },
    onExceed(files, fileList) {
      if (files.length > 5) {
        ElMessage.warning({
          message: this.$t('issueEdit.msg.tooManyFilesPasted')
        })
      }
    },
    handleFilePasteEvent(event) {
      let items = (event.clipboardData || event.originalEvent.clipboardData).items

      if (items && items.length) {
        // No more than 5 files can be pasted at once
        if (items?.length > 5) {
          ElMessage.warning({
            message: this.$t('issueEdit.msg.tooManyFilesPasted')
          })
          return
        }

        for (const item of items) {
          if (item.kind !== 'file') {
            console.log('Non-file content ignored: ', item)
            continue
          }

          let file = item.getAsFile()
          console.log('Pasted file: ', file)

          const tooLarge = file.size / 1024 / 1024 > 100
          if (tooLarge) {
            ElMessage.warning({
              message: this.$t('issueEdit.msg.fileSizeLimit')
            })
            continue
          }

          this.uploading = true

          uploader.initUploadParams(file, this.projectId, 'ISSUE_ATTACHMENT').then((params) => {
            this.uploadParams = params
            uploader
              .upload(file, params)
              .then((uploadRes) => {
                this.imgUploadSuccess(uploadRes, file)
              })
              .catch((err) => {
                this.imgUploadError(err, file)
              })
          })
        }
      }
    },
    deleteIssue() {
      ElMessageBox.confirm(
        this.$t('issueEdit.msg.delIssueConfirmMsg', { issueName: this.editIssue.name }),
        this.$t('issueEdit.msg.delIssueConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          this.deleting = true
          issueApi
            .delete(this.editIssue.id)
            .then(() => {
              ElMessage.success({
                message: this.$t('issueEdit.msg.issueDeleted')
              })
              this.$emit('onIssueDeleted', this.editIssue)
              this.dialogVisible = false
            })
            .finally(() => {
              this.deleting = false
            })
        })
        .catch((err) => {
          // Cancelled, do nothing
        })
    },
    saveIssue() {
      if (this.showCommentInput && this.editingComment && this.commentContent) {
        this.saving = true
        this.saveComment()
        setTimeout(() => {
          this.doSaveIssue()
        }, 500)
      } else {
        this.doSaveIssue()
      }
    },
    doSaveIssue() {
      this.$refs['issueFormRef'].validate((valid) => {
        if (!valid) {
          ElMessage.error({
            message: this.$t('common.msg.formValidationFail')
          })
          return
        } else {
          const method = this.editIssue.id ? 'update' : 'create'
          this.saving = true
          issueApi[method](this.editIssue)
            .then((res) => {
              ElMessage.success({
                message: this.editIssue.id
                  ? this.$t('issueEdit.msg.issueUpdated')
                  : this.$t('issueEdit.msg.issueCreated')
              })

              this.editIssue = this.formatIssue(res.data)
              this.editIssue.changed = true
              this.dialogVisible = false
            })
            .finally(() => {
              this.saving = false
            })
        }
      })
    },
    initUploadParams(file) {
      const tooLarge = file.size / 1024 / 1024 > 100
      if (tooLarge) {
        ElMessage.warning({
          message: this.$t('issueEdit.msg.fileSizeLimit')
        })
        return false
      } else {
        this.uploading = true

        return uploader.initUploadParams(file, this.projectId, 'ISSUE_ATTACHMENT').then((params) => {
          this.uploadParams = params
        })
      }
    },
    imgUploadError(err, file) {
      this.uploading = false
      ElMessage.error({
        message: this.$t('common.msg.uploadFailed')
      })
      console.error('File upload error:', err)
    },
    imgUploadSuccess(uploadRes, file) {
      const fileDto = {
        name: file.name,
        fullPath: uploadRes,
        type: uploader.getFileType(file.type || file.raw.type),
        size: file.size,
        projectId: this.project.id,
        targetType: 'ISSUE_ATTACHMENT',
        storageProvider: this.uploadParams.provider,
        urlPrefix: this.uploadParams.urlPrefix
      }

      issueApi.addFile(this.editIssueId, fileDto).then((res) => {
        this.hideFilePasteInput()
        this.editIssue.files.push(res.data)
        this.initImgPreviewSrcList()
        this.uploading = false
      })
    },
    deleteFile(index, file) {
      ElMessageBox.confirm(this.$t('issueEdit.msg.delFileConfirmMsg'), this.$t('issueEdit.msg.delFileConfirmTitle'), {
        type: 'warning',
        draggable: true
      }).then(() => {
        issueApi.deleteFile(this.editIssueId, file.id).then(() => {
          ElMessage.success({
            message: this.$t('issueEdit.msg.fileDeleted')
          })
          this.editIssue.files.splice(index, 1)
          this.initImgPreviewSrcList()
        })
      })
    },
    newComment() {
      this.showCommentInput = true
      this.editingComment = {
        issueId: this.editIssue.id,
        content: ''
      }
      this.commentContent = ''

      // The comment editing form is not visible at this moment, and will be visible after next tick
      this.$nextTick(() => {
        this.scrollToCommentEditingForm()
      })
    },
    editComment(index) {
      this.showCommentInput = true
      this.editingComment = this.editIssue.comments[index]
      this.commentContent = this.editingComment.content

      // The comment editing form is not visible at this moment, and will be visible after next tick
      this.$nextTick(() => {
        this.scrollToCommentEditingForm()
      })
    },
    deleteComment(index) {
      ElMessageBox.confirm(
        this.$t('issueEdit.msg.delCommentConfirmMsg'),
        this.$t('issueEdit.msg.delCommentConfirmTitle'),
        {
          type: 'warning',
          draggable: true
        }
      )
        .then(() => {
          let comment = this.editIssue.comments[index]
          commentApi.delete(comment.id).then((res) => {
            ElMessage.success({
              message: this.$t('issueEdit.msg.commentDeleted')
            })

            this.editIssue.comments.splice(index, 1)
            this.editIssue.changed = true
          })
        })
        .catch(() => {})
    },
    cancelEditComment() {
      this.finishEditingComment()
    },
    commentChanged(event) {
      this.saveComment()
    },
    saveComment() {
      if (this.commentContent && this.commentContent.trim()) {
        this.editingComment.content = this.commentContent.trim()

        if (this.editingComment.id) {
          commentApi.update(this.editingComment.id, this.editingComment).then((res) => {
            ElMessage.success({
              message: this.$t('issueEdit.msg.commentUpdated')
            })

            let index = utils.indexInArray(this.editIssue.comments, this.editingComment.id)
            this.editIssue.comments.splice(index, 1, res.data)
            this.editIssue.changed = true
            this.finishEditingComment()
          })
        } else {
          commentApi.create(this.editingComment).then((res) => {
            ElMessage.success({
              message: this.$t('issueEdit.msg.commentCreated')
            })

            if (!this.editIssue.comments) {
              this.editIssue.comments = []
            }

            this.editIssue.comments.push(res.data)
            this.editIssue.changed = true
            this.finishEditingComment()
          })
        }
      } else {
        ElMessage.error({
          message: this.$t('issueEdit.msg.missingComment')
        })
      }
    },
    finishEditingComment() {
      this.showCommentInput = false
      this.editingComment = null
      this.commentContent = ''
    },
    scrollToCommentEditingForm: function () {
      document.querySelector('#issueCommentInputField').scrollIntoView()

      this.$nextTick(() => {
        document.querySelector('#commentEditingTextArea').focus()
      })
    },
    tabClicked(name) {
      if (this.activeTab == 'history') {
        this.loadIssueHistories()
      }
    },
    loadIssueHistories() {
      if (this.historyTotalPages === null || this.historyTotalPages > this.historyPage) {
        this.historyPage++
        issueApi.getHistories(this.editIssue.id, { page: this.historyPage }).then((res) => {
          this.histories = this.histories.concat(res.data.results)
          this.historyTotalPages = res.data.totalPages
        })
      }
    },
    searchAllIssue() {
      this.searchIssue()
    },
    searchIssue(query) {
      if (query) {
        this.issueFilter.keyword = query.trim()
      } else {
        this.issueFilter.keyword = null
      }

      issueApi.searchIssues(this.issueFilter).then((res) => {
        let alreadyLinkedIssueIds = this.linkedIssues.map((issue) => issue.id)
        alreadyLinkedIssueIds.push(this.editIssue.id)
        this.issueSelectResult = res.data.results.filter((issue) => !alreadyLinkedIssueIds.includes(issue.id))
      })
    },
    linkIssue(selectedIssueId) {
      let selectedIssue = this.issueSelectResult.find((issue) => issue.id == selectedIssueId)
      issueApi.createLink(this.editIssue.id, selectedIssue.id).then(() => {
        ElMessage.success({
          message: this.$t('issueEdit.msg.linkCreated')
        })
        this.linkedIssues.push(selectedIssue)
        this.editIssue.linkToIssues.push(selectedIssue)
        this.selectedIssue = null
        this.issueSelectResult = []
        this.issueFilter.keyword = null
        this.issueSelectorVisible = false
        this.$emit('onIssueLinked', this.editIssue, selectedIssueId)
      })
    },
    unlinkIssue(issue) {
      ElMessageBox.confirm(this.$t('issueEdit.msg.unlinkConfirmMsg'), this.$t('issueEdit.msg.unlinkConfirmTitle'), {
        confirmButtonText: this.$t('common.ok'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning',
        draggable: true
      })
        .then(() => {
          issueApi.deleteLink(this.editIssue.id, issue.id).then(() => {
            let index = utils.indexInArray(this.linkedIssues, issue.id)
            this.linkedIssues.splice(index, 1)
            ElMessage.success({
              message: this.$t('issueEdit.msg.linkDeleted')
            })
            this.$emit('onIssueUnlinked', this.editIssue, issue)
          })
        })
        .catch(() => {})
    },
    addIssueLinkClicked() {
      this.issueSelectorVisible = true
      this.$nextTick(() => {
        this.scrollToIssueLinkInput()
      })
    },
    scrollToIssueLinkInput() {
      document.querySelector('.el-tabs').scrollIntoView()

      this.$nextTick(() => {
        document.querySelector('#issueSelector').focus()
      })
    },
    issueSearcherClose() {
      setTimeout(() => {
        this.issueFilter.keyword = null
        this.issueSelectorVisible = false
        this.selectedIssue = null
        this.issueSelectResult = []
      }, 300)
    },
    issueDialogClosed() {
      if (this.editIssue.changed) {
        this.$emit('onIssueUpdated', this.editIssue)
      }

      this.$emit('issueFormClosed')
    },
    showLinkedIssue(linkedIssue) {
      this.linkedIssueInfo = linkedIssue
      this.showLinkedIssueDialog = true
    },
    issueUpdated(issue) {
      this.$emit('onIssueUpdated', issue)
    },
    issueDeleted(issue) {
      this.$emit('onIssueDeleted', issue)
    },
    issueLinked(selectedIssueId) {
      this.$emit('onIssueLinked', selectedIssueId)
    },
    issueUnlinked(unlinkIssue) {
      this.$emit('onIssueUnlinked', unlinkIssue)
    },
    issueFormClosed() {
      this.showLinkedIssueDialog = false
    }
  }
}
</script>

<style lang="less" scoped>
.issue-group-option {
  display: flex;
  align-items: center;
}
</style>

<style lang="less">
.issue-edit-dialog {
  .el-upload {
    --el-upload-dragger-padding-horizontal: 2px;
  }

  .issue-title-input {
    textarea {
      font-size: 18px;
      font-weight: 500;
      color: #333333;
    }
  }

  .el-form-item__label {
    font-weight: 500;
    color: #999999;
  }

  .desc-row {
    .el-form-item__content > div {
      width: 100%;
      .desc-md {
        // flex-grow: 1;
        overflow: auto;
        padding: 5px 11px;
        line-height: 1.5;

        :first-child {
          margin-top: 0;
        }
        :last-child {
          margin-bottom: 0;
        }
      }

      .action-btn {
        position: absolute;
        right: 0;
        bottom: 0;
        visibility: hidden;
        background-color: #e7f5f3;
        color: var(--el-color-primary);
        backdrop-filter: blur(3px);
      }

      &:hover {
        .action-btn {
          visibility: visible;
          &:hover {
            background-color: #d1f2ec;
          }
        }
      }
    }
  }
}

.tag-select-popover {
  padding: 12px 0px !important;
  max-height: 300px;
  overflow: auto;

  .tag-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 20px;

    &:hover {
      background-color: #f4f4f4;
      cursor: pointer;
    }
  }
}

.history-details-popover {
  width: 540px !important;

  @media only screen and (max-width: 768px) {
    width: 91%;
  }
}

.issue-edit-dialog {
  .el-select-dropdown {
    max-width: 580px;
  }

  .issue-full-name-tooltip {
    max-width: 300px;
  }

  .tag-container {
    margin-left: 10px;
    .tag-item {
      margin-right: 5px;

      .el-tag__content {
        display: flex;
      }

      .del-icon {
        display: none;
        margin-left: 3px;
        color: #999;
        background-color: #eee;
        cursor: pointer;
      }

      &:hover {
        .del-icon {
          display: inline-flex;
        }
      }
    }
  }

  .el-tabs {
    margin-top: 10px;
  }

  .el-dialog__body {
    padding: 10px 30px;
    min-height: 200px;
    max-height: 70vh;
    overflow: auto;

    @media only screen and (max-width: 768px) {
      max-height: unset;
      padding: 10px;
    }

    .issue-img-list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      padding-left: 8px;

      .file-paste-input {
        width: 40px;
        height: 42px;
        text-align: center;
        margin-bottom: 10px;
        border: 3px dashed var(--el-color-primary);
        border-radius: 6px;

        &:focus {
          outline: none;
        }
      }

      .file-uploader {
        margin-bottom: 10px;
        .el-upload {
          width: 50px;
          height: 50px;
          line-height: 50px;
          border: none;

          i {
            font-size: 18px;
          }
        }

        .el-upload-dragger {
          width: 100%;
          height: 100%;
          background-color: inherit;
          border-width: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .issue-img-item {
        position: relative;
        display: flex;
        margin-bottom: 10px;

        .issue-img {
          width: 50px;
          height: 50px;
          margin-right: 10px;

          img {
            object-fit: contain;
          }
        }

        .img-action-icon {
          position: absolute;
          color: #666666;
          font-size: 12px;
          cursor: pointer;
          visibility: hidden;
          background-color: #cccccc;
          padding: 3px;
          border-radius: 50%;

          &:hover {
            background-color: #999999;
            color: #ffffff;
          }
        }

        .delete-img-icon {
          top: -3px;
          right: 6px;
        }

        .download-img-icon {
          left: -3px;
          top: -3px;
        }

        &:hover {
          .img-action-icon {
            visibility: visible;
          }
        }
      }
    }
    .link-issue {
      label {
        font-weight: bold;
      }

      .el-form-item__content {
        margin-left: 0 !important;
      }

      .el-input__inner {
        border: 1px solid #dcdfe6;
      }

      .link-issue-table {
        .el-table__body-wrapper {
          overflow: hidden;
        }
      }

      .issue-selector {
        height: auto;
      }
    }

    .comments-list {
      height: 100%;
      padding-top: 10px;
      margin-bottom: 10px;

      .el-timeline {
        padding-left: 3px;

        .el-timeline-item {
          padding-bottom: 15px;
          padding-right: 10px;

          .el-timeline-item__tail {
            left: 10px;
          }

          .el-timeline-item__timestamp {
            font-size: 12px;
            color: #999999;
          }

          .el-timeline-item__dot {
            // background-color: #ffffff;
            top: -5px;
          }

          .el-timeline-item__wrapper {
            margin-left: 28px;
            padding-left: 0px;
          }

          .el-timeline-item__content {
            line-height: 16px;
            font-size: 13px;
            display: flex;
            justify-content: space-between;
            position: relative;

            .comment-item-actions {
              position: absolute;
              right: 5px;
              top: -20px;
              min-width: 40px;
              display: flex;
              justify-content: space-between;
              visibility: hidden;
            }

            pre {
              margin: 0;
              white-space: break-spaces;
            }
          }

          &:hover {
            .el-timeline-item__timestamp {
              color: #b0b0b0;
            }

            .comment-item-actions {
              visibility: visible;
              color: #999999;

              i {
                &:hover {
                  color: #303133;
                  cursor: pointer;
                }
              }
            }
          }
        }
      }
    }
    .el-table {
      margin-top: -20px;
      margin-bottom: 30px;
      .el-table__row {
        .delete-icon {
          float: right;
          visibility: hidden;
        }
        &:hover {
          .delete-icon {
            visibility: visible;
            color: #999999;

            &:hover {
              cursor: pointer;
              color: #303133;
            }
          }
        }
      }
    }
    .el-table th,
    .el-table td {
      padding: 8px 0;
    }
  }

  .el-dialog__footer {
    padding-top: 20px;
  }

  .el-form-item__content {
    .compact-row {
      display: flex;
      justify-content: space-between;

      .el-select {
        width: 43%;
      }
    }
  }
  .el-select,
  .el-cascader {
    width: 100%;
  }

  .btn-delete-issue {
    float: left;
  }

  .el-tabs__header {
    height: 32px;
  }

  .el-tabs__item {
    height: 32px;
    line-height: 32px;
  }
}

.video-preview-dialog {
  .el-dialog__body {
    padding-top: 5px;
  }
}
</style>

<style lang="less" scoped>
.issue-edit-dialog {
  .dialog-title {
    font-size: 16px;
    font-weight: bold;
  }
  .header-issue-code {
    display: flex;
    align-items: center;
    .issue-code {
      margin-left: 8px;
      font-weight: bold;
      color: var(--el-color-primary);
    }

    .header-btn {
      &:first-of-type {
        margin-left: 30px;
      }
    }
  }

  .action-btn {
    margin-left: 10px;
    cursor: pointer;
    margin: 4px 0;
    padding: 2px 8px;
    height: 18px;
    font-size: 12px;
    color: #999999;
    font-weight: 450;
    white-space: nowrap;
    border-radius: 4px;

    &:hover {
      color: var(--el-color-primary);
      background-color: #e7f5f3;
    }
  }

  .submit-comment-shortcut {
    margin-left: 16px;
  }

  .comment-action-btns {
    display: flex;
    justify-content: flex-end;
    padding-bottom: 5px;
  }

  .show-history-details {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
}

.issue-item-row {
  height: 100%;
  display: flex;
  align-items: center;
  line-height: 16px;

  .issue-type-icon-container {
    margin-right: 10px;
  }

  .issue-code-name {
    display: flex;
    width: 100%;
    text-overflow: ellipsis;
    overflow: hidden;
    cursor: pointer;
  }

  .name {
    margin-left: 10px;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  .code {
    color: var(--el-color-primary);
    font-weight: bold;
    white-space: nowrap;
  }
}
</style>
