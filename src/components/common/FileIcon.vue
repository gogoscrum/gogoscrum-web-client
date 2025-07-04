<template>
  <div :class="`file-icon-container ${size}`">
    <img :class="`blank-file-img ${size}`" src="@/assets/images/file-empty-icon.png" />
    <img v-if="types[type].icon" :class="`inner-icon ${size}`" :src="imgSrc" />
    <div :class="`file-type ${size} ${type}`">
      <div class="smaller-text">{{ types[type].label }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    type: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: 'large'
    }
  },
  computed: {
    imgSrc() {
      const imgUrl = new URL(`/src/assets/images/file-icons/${this.types[this.type].icon}`, import.meta.url)
      return imgUrl
    }
  },
  data() {
    return {
      types: {
        AUDIO: {
          label: 'MP3',
          icon: 'audio.png'
        },
        VIDEO: {
          label: 'MP4',
          icon: 'video.png'
        },
        WORD: {
          label: 'DOC',
          icon: 'word.png'
        },
        PDF: {
          label: 'PDF',
          icon: 'pdf.png'
        },
        PPT: {
          label: 'PPT',
          icon: 'ppt.png'
        },
        EXCEL: {
          label: 'XLS',
          icon: 'excel.png'
        },
        ZIP: {
          label: 'ZIP',
          icon: 'zip.png'
        },
        RAR: {
          label: 'RAR',
          icon: 'rar.png'
        },
        OTHER: {
          label: 'OTHER'
        }
      }
    }
  },
  mounted() {},
  methods: {}
}
</script>

<style lang="less" scoped>
.file-icon-container {
  position: relative;
  height: 50px;
  width: 50px;

  &.small {
    height: 32px;
    width: 32px;
  }

  .blank-file-img {
    position: absolute;
    right: 3px;
    height: 100%;
    object-fit: contain;
    opacity: 30%;

    &.small {
      right: 1px;
    }
  }

  .inner-icon {
    position: absolute;
    top: 5px;
    left: 12px;
    height: 18px;

    &.small {
      top: 3px;
      left: 10px;
      height: 12px;
    }
  }

  .file-type {
    color: #eeeeee;
    position: absolute;
    bottom: 8px;
    border-radius: 5px;
    font-size: 15px;
    font-weight: bold;
    line-height: 16px;
    width: 75%;
    text-align: center;
    white-space: nowrap;

    &.small {
      bottom: 4px;
      border-radius: 2px;
      font-size: 12px;
      font-weight: bold;
      line-height: 11px;
      width: 80%;
    }

    .smaller-text {
      transform: scale(0.8);
      word-break: keep-all;
    }
  }

  .AUDIO {
    background-color: #7e7fef;
  }
  .VIDEO {
    background-color: #0db19b;
  }
  .WORD {
    background-color: #4d83f2;
  }
  .PDF {
    background-color: #dc4032;
  }
  .PPT {
    background-color: #e27138;
  }
  .EXCEL {
    background-color: #1fa144;
  }
  .ZIP {
    background-color: #eaad41;
  }
  .RAR {
    background-color: #721570;
  }
  .OTHER {
    font-size: 9px;
    background-color: #787a78;
  }
}
</style>
