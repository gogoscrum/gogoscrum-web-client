<template>
  <div class="status-tag-container">
    <span :class="`status-tag ${status}`">{{ label || status }}</span>
  </div>
</template>

<script>
export default {
  props: {
    status: {
      type: String,
      default: null
    },
    label: {
      type: String,
      require: false,
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
.status-tag-container {
  display: flex;

  .status-tag {
    padding: 0 6px;
    border-radius: 5px;
    font-size: 11px;
    font-weight: bold;
    white-space: nowrap;
    height: 20px;
    line-height: 20px;
    border: solid 1px #99999911;

    &.TO_DO {
      background-color: #f0f0f0;
      color: #8f8f8f;
    }

    &.IN_PROGRESS {
      background-color: #edf5fa;
      color: #0a64ca;
    }

    &.DONE {
      background-color: #ecf7ef;
      color: #02b11f;
    }
  }
}
</style>
