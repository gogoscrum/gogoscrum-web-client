<template>
  <div class="issue-list-page page">
    <IssueListNew
      v-if="filter"
      :project-id="projectId"
      :issue-filter="filter"
      :filter-columns="[]"
      @page-size-changed="pageSizeChanged"
      @issue-filter-changed="filterChanged">
      <template #extraActionBtns>
        <div class="ml-4">
          <IssueFilter v-model="filter" :project="project" placement="right-start" />
        </div>
      </template>
    </IssueListNew>
  </div>
</template>
<script>
import IssueListNew from '@/components/issue/IssueListNew.vue'
import IssueFilter from '@/components/issue/IssueFilterNew.vue'
import { issueFilterApi } from '@/api/issue.js'

export default {
  name: 'IssueList',
  components: {
    IssueListNew,
    IssueFilter
  },
  data() {
    return {
      projectId: null,
      project: {},
      filter: this.newFilter()
    }
  },
  watch: {
    $route(to, from) {
      const filterId = to.query.filterId
      if (filterId) {
        this.loadFilter(filterId)
      } else {
        this.filter = this.newFilter()
      }
    }
  },
  created() {
    this.projectId = this.$route.params.projectId
    this.project = this.$store.get('project')

    const filterId = this.$route.query.filterId
    if (filterId) {
      this.loadFilter(filterId)
    } else {
      this.filter = this.newFilter()
    }
  },
  methods: {
    newFilter() {
      return {
        projectId: this.projectId,
        keyword: null,
        pageSize: this.$store.get('issueListPageSize') || 10
      }
    },
    loadFilter(filterId) {
      issueFilterApi.getById(filterId).then((res) => {
        this.filter = res.data
      })
    },
    pageSizeChanged(size) {
      // Update the local store for issue list page size.
      // Don't need to handle the pagination as the IssueList component will handle it.
      this.$store.set('issueListPageSize', size)
    },
    filterChanged(newFilter) {
      this.filter = newFilter
    }
  }
}
</script>

<style lang="less" scoped>
.issue-list-page {
}
</style>
