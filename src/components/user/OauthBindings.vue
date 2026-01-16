<template>
  <div>
    <div v-if="providers" class="oauth-bindings-list">
      <div class="bindings-item" v-for="(provider, index) in providers" :key="provider.name">
        <div class="info">
          <img class="icon" :src="provider.iconUrl" />
          <span class="name">{{ provider.displayName }}</span>
        </div>
        <div v-if="bindingsMap[provider.name]" class="desc">{{ bindingsMap[provider.name].createdTimeFormatted }}</div>
        <el-button
          v-if="bindingsMap[provider.name]"
          type="danger"
          plain
          size="small"
          class="action-btn"
          @click="unbind(bindingsMap[provider.name].id, index)"
          >{{ $t('userInfo.oauth.unbind') }}</el-button
        >
        <el-button v-else type="info" plain disabled size="small" class="action-btn">{{
          $t('userInfo.oauth.notBound')
        }}</el-button>
      </div>
    </div>
    <div v-else class="empty">{{ $t('userInfo.oauth.empty') }}</div>
  </div>
</template>

<script>
import { userApi } from '@/api/user.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import utils from '@/utils/util.js'

export default {
  name: 'OauthBindings',
  props: {
    user: {
      type: Object,
      default: () => {
        return {}
      }
    },
    providers: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      bindingsMap: {}
    }
  },
  created() {
    this.initBindingsMap()
  },
  methods: {
    initBindingsMap() {
      // put the bindings into map by its name
      this.user.bindings.map((binding) => {
        utils.formatCreateUpdateTime(binding)
        this.bindingsMap[binding.provider] = binding
      })
    },
    unbind(bindingId, index) {
      ElMessageBox.confirm(
        this.$t('userInfo.oauth.unbindConfirmMsg', { provider: this.providers[index].displayName }),
        this.$t('userInfo.oauth.unbindConfirmTitle'),
        {
          type: 'warning',
          dangerouslyUseHTMLString: true,
          draggable: true
        }
      )
        .then(() => {
          userApi.unbindOauth(bindingId).then((res) => {
            ElMessage({
              showClose: true,
              message: this.$t('userInfo.oauth.unbindSuccess'),
              type: 'success',
              center: true
            })
            // remove the binding from map
            this.bindingsMap[this.providers[index].name] = null
          })
        })
        .catch(() => {})
    }
  }
}
</script>

<style lang="less" scoped>
.oauth-bindings-list {
  margin-left: 24px;

  .bindings-item {
    display: flex;
    justify-content: space-between;
    place-items: center;
    margin-bottom: 20px;

    .info {
      display: flex;
      place-items: center;
      font-weight: bold;
    }

    .icon {
      height: 24px;
      width: 30px;
      object-fit: contain;
      margin-right: 8px;
    }

    .action-btn {
      min-width: 90px;
    }
  }
}
</style>
