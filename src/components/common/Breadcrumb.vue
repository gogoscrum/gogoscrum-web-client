<template>
  <div class="breadcrumb-container">
    <el-breadcrumb separator-icon="ArrowRight">
      <template v-for="(item, index) in breadcrumb" :key="index">
        <el-breadcrumb-item v-if="item.route" :to="item.route" :key="index">{{ item.label }}</el-breadcrumb-item>
        <el-breadcrumb-item v-else>{{ item.label }}</el-breadcrumb-item>
      </template>
    </el-breadcrumb>
  </div>
</template>

<script>
export default {
  name: 'Breadcrumb',
  props: {
    breadcrumb: {
      type: Array,
      default: () => {
        return {}
      }
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
.breadcrumb-container {
  margin: 16px 0;
}
</style>
