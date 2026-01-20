<template>
  <div class="backlog-page page">
    <IssueListNew
      :project-id="projectId"
      :issue-filter="filter"
      :columns="columns"
      :filter-columns="['type', 'priority', 'owner', 'status']"
      @page-size-changed="pageSizeChanged" />
  </div>
</template>
<script>
import IssueListNew from '@/components/issue/IssueListNew.vue'

export default {
  name: 'Backlog',
  components: {
    IssueListNew
  },
  data() {
    return {
      projectId: null,
      filter: {
        projectId: null,
        backlog: true,
        keyword: null,
        pageSize: this.$store.get('backlogPageSize') || 10
      },
      columns: this.$store.get('backlogColumns') || [
        'code',
        'name',
        'storyPoints',
        'priority',
        'owner',
        'status',
        'actions'
      ]
    }
  },
  created() {
    this.projectId = this.$route.params.projectId
    this.filter.projectId = this.projectId
  },
  methods: {
    pageSizeChanged(size) {
      // Update the local store for backlog page size. Don't need to handle the pagination as the IssueList component will handle it.
      this.$store.set('backlogPageSize', size)
    }
  }
}
</script>

<style lang="less" scoped>
.backlog-page {
}
</style>
