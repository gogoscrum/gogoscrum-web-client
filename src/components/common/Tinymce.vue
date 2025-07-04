<template>
  <div class="tinymce-box">
    <editor v-model="myModelValue" licenseKey="gpl" :init="init" :disabled="disabled"> </editor>
  </div>
</template>
<script setup>
import Editor from '@tinymce/tinymce-vue'
import tinymce from 'tinymce/tinymce'
import uploader from '@/utils/uploader.js'
import { computed, nextTick, onMounted, reactive } from 'vue'

onMounted(() => {
  nextTick(() => {
    tinymce.init({})
  })
})

const emit = defineEmits(['update:modelValue'])
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  plugins: {
    type: [String, Array],
    default: 'lists image table wordcount link code preview'
  },
  toolbar: {
    type: [String, Array],
    default:
      'undo redo |  blocks | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | lists image table | link | code preview'
  },
  height: {
    type: Number,
    default: 400
  },
  menubar: {
    type: [Boolean, String],
    default: 'edit insert view format table tools help'
  },
  branding: {
    type: Boolean,
    default: false
  },
  dark: {
    type: Boolean,
    default: false
  }
})

const { height, plugins, toolbar, branding, menubar, dark } = props
const init = reactive({
  relative_urls: false,
  highlight_on_focus: false,
  image_dimensions: false,
  image_description: false,
  image_class_list: [{ title: 'Auto', value: 'img-fluid' }],
  content_style: '.img-fluid{ max-width: 100%;  height: auto;  object-fit: cover;}',
  base_url: import.meta.env.VITE_TINY_MCE_BASE_URL,
  suffix: '.min',
  language: localStorage['locale'] == 'en' ? 'en' : 'zh_CN',
  height: height,
  plugins: plugins,
  toolbar: toolbar,
  branding: branding,
  menubar: menubar,
  images_upload_handler: uploader.uploadFromTinymce,
  paste_data_images: true,
  skin: dark ? 'oxide-dark' : 'oxide',
  content_css: dark ? 'dark' : 'default'
})

const myModelValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})
</script>
