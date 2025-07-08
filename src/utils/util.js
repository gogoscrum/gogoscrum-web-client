import store from '@/modules/store'
import { i18n } from '@/modules/i18n.js'
import dayjs from 'dayjs'

const indexInArray = function (objects, objectId) {
  return objects.findIndex((object) => object.id === objectId)
}

const toggleFullscreen = function (element) {
  if (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement
  ) {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  } else {
    if (element.requestFullscreen) {
      element.requestFullscreen()
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT)
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }
  }
}

const getLang = () => {
  let lang = ''
  if (navigator.languages != undefined) {
    lang = navigator.languages[0]
  } else {
    lang = navigator.language
  }
  if (lang.startsWith('zh')) {
    return 'cn'
  } else {
    return 'en'
  }
}

const changeMetaForI18n = () => {
  let descElement = document.querySelector('head meta[name="description"]')
  let keywordsElement = document.querySelector('head meta[name="keywords"]')
  descElement.setAttribute('content', i18n.global.t('meta.description'))
  keywordsElement.setAttribute('content', i18n.global.t('meta.keywords'))
  document.title = i18n.global.t('meta.title')
}

const downloadFile = (fileBlob, fileName) => {
  const blob = new Blob([fileBlob], {
    type: 'application/x-download;charset=UTF-8'
  })
  if (window.navigator.msSaveOrOpenBlob) {
    navigator.msSaveBlob(blob, fileName)
  } else {
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.style.display = 'none'
    a.href = href
    a.download = fileName
    a.click()
    URL.revokeObjectURL(a.href)
  }
}

const isInMobile = () => {
  return window.screen.width <= 768
}

const isMac = () => {
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0
}

const getCtrlKey = () => {
  return isMac() ? '⌘' : 'Ctrl'
}

const loadLastViewedBoardId = (currentUserId, projectId) => {
  let key = `u-${currentUserId}-p-${projectId}-s`
  return store.get(key)
}

const getLastViewedOrDefaultSprint = (currentUserId, project) => {
  let sprint = null

  if (project.sprints && project.sprints.length) {
    let lastViewedSprintId = loadLastViewedBoardId(currentUserId, project.id)

    if (lastViewedSprintId) {
      let index = indexInArray(project.sprints, lastViewedSprintId)

      if (index >= 0) {
        sprint = project.sprints[index]
      }
    }

    if (!sprint) {
      sprint = project.sprints[0]
    }
  }

  return sprint
}

const formatCreateUpdateTime = (entity) => {
  if (entity.createdTime) {
    entity.createdTimeFormatted = dayjs(entity.createdTime).format('YYYY-MM-DD HH:mm:ss')
  }

  if (entity.updatedTime) {
    entity.updatedTimeFormatted = dayjs(entity.updatedTime).format('YYYY-MM-DD HH:mm:ss')
  }
  return entity
}

const formatAndCaclSprintStatus = (sprint) => {
  if (sprint.startDate) {
    sprint.startDateFormatted = dayjs(sprint.startDate).format('YYYY-MM-DD')
  }
  if (sprint.endDate) {
    sprint.endDateFormatted = dayjs(sprint.endDate).format('YYYY-MM-DD')
  }

  formatCreateUpdateTime(sprint)

  const now = dayjs()

  if (sprint.startDate && sprint.endDate) {
    let startDate = dayjs(sprint.startDate)
    let endDate = dayjs(sprint.endDate)

    if (endDate < now) {
      sprint.status = 'DONE'
    } else if (startDate > now) {
      sprint.status = 'TO_DO'
    } else {
      sprint.status = 'IN_PROGRESS'
    }
  }
  return sprint
}

const isLocalhost = (url) => {
  const hostname = new URL(url).hostname
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]'
}

const toFullUrl = (path) => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${window.location.origin}${path}`
}

export default {
  indexInArray,
  toggleFullscreen,
  getLang,
  changeMetaForI18n,
  isInMobile,
  isMac,
  getCtrlKey,
  downloadFile,
  loadLastViewedBoardId,
  getLastViewedOrDefaultSprint,
  formatCreateUpdateTime,
  formatAndCaclSprintStatus,
  isLocalhost,
  toFullUrl
}
