<template>
  <div class="priority-icon-container">
    <div v-if="priority" :class="`priority-icon ${priority} `" :title="$t(`issuePriorities.${priority}`)">
      <span v-if="['CRITICAL', 'MAJOR', 'NORMAL'].includes(priority)" class="iconfont icon-arrow-up"></span>
      <span v-else class="iconfont iconfont-arrow-down"></span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    priority: {
      type: String,
      default: null
    }
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="less">
.issue-card-body {
  .priority-icon-container {
    .priority-icon {
      .iconfont {
        font-size: 11px !important;
        font-weight: 400 !important;
        line-height: 14px;
      }
    }
  }
}
</style>

<style lang="less" scoped>
.priority-icon-container {
  display: flex;
  .priority-icon {
    display: flex;

    .iconfont {
      font-size: 13px;
      font-weight: 800;
    }
  }

  .CRITICAL {
    color: red;
  }

  .MAJOR {
    color: rgb(255, 153, 0);
  }

  .NORMAL {
    color: rgb(14, 121, 243);
  }

  .LOW {
    color: rgb(9, 170, 4);
  }

  .TRIVIAL {
    color: rgb(161, 165, 161);
  }
}
</style>
