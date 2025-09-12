<template>
  <div class="contact-popover-inner">
    <div class="row">
      <div class="column">
        <div class="title">用户交流群</div>
        <img
          src="https://gogoscrum.oss-cn-hangzhou.aliyuncs.com/materials/wechat-qr-user-group.png"
          class="wechat-qr-img user-group" />
        <span class="desc">扫码加入<br />gogoscrum用户群</span>
      </div>
      <div class="column">
        <div class="title">官方公众号</div>
        <img
          src="https://gogoscrum.oss-cn-hangzhou.aliyuncs.com/materials/wechat-qr-official-account.jpg"
          class="wechat-qr-img" />
        <span class="desc">扫码关注<br />gogoscrum公众号</span>
      </div>
      <div class="column">
        <div class="title">抖音号</div>
        <img
          src="https://gogoscrum.oss-cn-hangzhou.aliyuncs.com/materials/douyin-qr-gogoscrum.jpg"
          class="wechat-qr-img user-group" />
        <span class="desc">抖音扫码<br />关注gogoscrum抖音号</span>
      </div>
      <div class="column">
        <div class="title">商业授权</div>
        <img
          src="https://gogoscrum.oss-cn-hangzhou.aliyuncs.com/materials/wechat-qr-contact-us.png"
          class="wechat-qr-img user-group" />
        <span class="desc">添加客服<br />了解商业授权</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactPop',
  props: {},
  computed: {},
  data() {
    return {}
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="less" scoped>
.contact-popover-inner {
  .row {
    display: flex;
    justify-content: space-around;

    .column {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin: 10px;

      .title {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 8px;
        color: #27272d;
      }

      .wechat-qr-img {
        width: 120px;
        height: 120px;

        &.user-group {
          width: 112px;
          height: 112px;
          padding: 4px;
        }
      }

      .desc {
        margin-top: 8px;
        text-align: center;
      }
    }
  }
}
</style>
