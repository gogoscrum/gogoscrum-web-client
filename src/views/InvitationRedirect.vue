<template>
  <div
    class="invitation-redirect-page"
    v-loading="loading"
    :element-loading-text="$t('invitationRedirect.joining')"></div>
</template>

<script>
import { projectApi } from '@/api/project.js'
import { ElMessage } from 'element-plus'
export default {
  data() {
    return {
      loading: true,
      invitationCode: null
    }
  },
  created() {
    this.invitationCode = this.$route.params.invitationCode
    if (this.invitationCode) {
      this.joinProject()
    } else {
      console.warn('Invitation code is empty')
    }
  },
  mounted() {},
  methods: {
    joinProject() {
      projectApi
        .join(this.invitationCode)
        .then((res) => {
          let project = res.data
          if (project && project.id) {
            ElMessage.success({
              message: this.$t('invitationRedirect.joinSucess', {
                projectName: project.name
              })
            })

            this.$router.push({
              name: 'BoardWithoutSprint',
              params: {
                projectId: project.id
              }
            })
          } else {
            console.warn('Join project failed')
          }
        })
        .catch((err) => {
          if (err.status === 406 && err.data.code === 'alreadyInProject') {
            if (err.data.extendValues && err.data.extendValues.projectId) {
              this.$router.push({
                name: 'BoardWithoutSprint',
                params: { projectId: err.data.extendValues.projectId }
              })
            } else {
              this.$router.push({ name: 'MyProjects' })
            }
          }
        })
    }
  }
}
</script>

<style lang="less" scoped>
.invitation-redirect-page {
  height: 80vh;
}
</style>
