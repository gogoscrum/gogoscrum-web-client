<template>
  <div class="issue-type-icon-container">
    <div :class="`bg-box ${type}`" :title="$t(`issueTypes.${type}`)">
      <span v-if="type === 'REQUIREMENT'" class="inner-icon iconfont icon-bookmark"></span>
      <span v-else-if="type === 'TASK'" class="inner-icon iconfont icon-check"></span>
      <span v-else-if="type === 'BUG'" class="inner-icon iconfont icon-bug"></span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: 'TASK'
    }
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="less" scoped>
.issue-type-icon-container {
  display: flex;
  align-items: center;

  .bg-box {
    border-radius: 2px;
    height: 14px;
    width: 14px;
    display: flex;

    .inner-icon {
      color: white;
      font-weight: 900;
      margin: auto;
      font-size: 12px;
      line-height: 12px;
    }
  }

  .REQUIREMENT {
    background-color: rgb(2, 177, 31);
  }

  .TASK {
    background-color: rgb(81, 177, 241);
  }

  .BUG {
    background-color: rgb(218, 30, 17);
  }
}
</style>
