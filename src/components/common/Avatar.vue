<template>
  <div class="vue-avatar--wrapper" aria-hidden="true">
    <div class="avator-icon" :class="{ colorBox: !isImage }" :style="[style, customStyle]">
      <img v-if="isImage" style="display: none" :src="src" @error="onImgError" />
      <div
        v-show="!isImage"
        class="color-box"
        :style="`word-break: keep-all; transform: scale(${1 / Math.sqrt(userInitial.length)});`">
        {{ userInitial }}
      </div>
    </div>
    <div v-if="showName" class="vue-avatar-name">
      {{ name }}
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'

const getInitials = (name) => {
  let parts = name.split(/[ -]/)
  let initials = ''

  for (var i = 0; i < parts.length; i++) {
    initials += parts[i].charAt(0)
  }

  if (initials.length > 3 && initials.search(/[A-Z]/) !== -1) {
    initials = initials.replace(/[a-z]+/g, '')
  }

  initials = initials.substring(0, 3).toUpperCase()

  return initials
}

const emits = defineEmits(['avatar-initials'])
const props = defineProps({
  name: {
    type: String
  },
  showName: {
    type: Boolean,
    default: false
  },
  initials: {
    type: String
  },
  backgroundColor: {
    type: String
  },
  color: {
    type: String
  },
  customStyle: {
    type: Object
  },
  inline: {
    type: Boolean
  },
  size: {
    type: Number,
    default: 50
  },
  src: {
    type: String
  },
  rounded: {
    type: Boolean,
    default: true
  },
  lighten: {
    type: Number,
    default: 220
  },
  parser: {
    type: Function
  }
})

onMounted(() => {
  if (!isImage) {
    emits('avatar-initials', props.name, userInitial)
  }
})

const state = reactive({
  backgroundColors: [
    '#F44336',
    '#FF4081',
    '#9C27B0',
    '#673AB7',
    '#3F51B5',
    '#2196F3',
    '#03A9F4',
    '#00BCD4',
    '#009688',
    '#4CAF50',
    '#8BC34A',
    '#CDDC39',
    '#FFC107',
    '#FF9800',
    '#FF5722',
    '#795548',
    '#9E9E9E',
    '#607D8B'
  ],
  imgError: false
})

const background = computed(() => {
  if (!isImage.value) {
    return props.backgroundColor || randomBackgroundColor(props.name.length, state.backgroundColors)
  }
  return null
})

const fontColor = computed(() => {
  if (!isImage.value) {
    return props.color || lightenColor(background.value, props.lighten)
  }
})

const isImage = computed(() => {
  return !state.imgError && Boolean(props.src)
})
const style = computed(() => {
  const style = {
    display: props.inline ? 'inline-flex' : 'flex',
    width: `${props.size}px`,
    height: `${props.size}px`,
    minWidth: `${props.size}px`,
    minHeight: `${props.size}px`,
    borderRadius: props.rounded ? '50%' : '25%',
    lineHeight: `${props.size + Math.floor(props.size / 20)}px`,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    userSelect: 'none'
  }
  const imgBackgroundAndFontStyle = {
    background: `transparent url('${props.src}') no-repeat scroll 0% 0% / ${props.size}px ${props.size}px content-box border-box`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }

  const initialBackgroundAndFontStyle = {
    background: background.value,
    font: `bold ${Math.floor(props.size / 1.5)}px/${props.size}px Helvetica, Arial, sans-serif`,
    color: fontColor.value
  }
  const backgroundAndFontStyle = isImage.value ? imgBackgroundAndFontStyle : initialBackgroundAndFontStyle
  Object.assign(style, backgroundAndFontStyle)

  return style
})

const userInitial = computed(() => {
  if (!isImage.value) {
    const initials = props.initials || getInitials(props.name)
    return initials
  }
  return ''
})

const onImgError = (evt) => {
  state.imgError = true
}

const randomBackgroundColor = (seed, colors) => {
  return colors[seed % colors.length]
}

const lightenColor = (hex, amt) => {
  // From https://css-tricks.com/snippets/javascript/lighten-darken-color/
  var usePound = false

  if (hex[0] === '#') {
    hex = hex.slice(1)
    usePound = true
  }

  var num = parseInt(hex, 16)
  var r = (num >> 16) + amt

  if (r > 255) r = 255
  else if (r < 0) r = 0

  var b = ((num >> 8) & 0x00ff) + amt

  if (b > 255) b = 255
  else if (b < 0) b = 0

  var g = (num & 0x0000ff) + amt

  if (g > 255) g = 255
  else if (g < 0) g = 0

  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
}
</script>

<style lang="less" scoped>
.vue-avatar--wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  .avator-icon.colorBox {
    background-image: linear-gradient(180deg, #00000000 0%, #00000000 50%, #0000002f 100%) !important;
  }

  .vue-avatar-name {
    margin-left: 8px;
  }
}
</style>
