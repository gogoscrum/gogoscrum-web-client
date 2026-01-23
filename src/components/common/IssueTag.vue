<template>
  <el-tag size="small" effect="dark" :hit="false" class="no-border issue-tag" :color="tag.color || '#999999'">
    {{ tag.name }}
  </el-tag>
</template>

<script>
export default {
  name: 'IssueTag',
  props: {
    tag: {
      type: Object,
      default: null
    }
  },
  data() {
    return {}
  },
  created() {},
  mounted() {},
  methods: {}
}
</script>

<style lang="less" scoped></style>
