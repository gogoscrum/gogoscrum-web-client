<template>
  <el-tooltip
          v-if="value !== null"
          placement="left"
          :content="$t('issueRow.storyPoint', { points: value })">
          <div class="story-point-tag">
            {{ value }}
          </div>
        </el-tooltip>
</template>

<script>
export default {
  props: {
    value: {
      type: Number,
      require: true,
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

<style lang="less" scoped>
  .story-point-tag {
    display: inline-block;
    height: 20px;
    line-height: 16px;
    min-width: 25px;

    // &:hover {
    //   background-color: #dddddd;
    // }
  }
</style>
