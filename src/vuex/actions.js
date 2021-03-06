import fetchival from 'fetchival'
import find from 'lodash/find'
import Pdf from 'jspdf'
import { nextTick, timeout } from '../utils'

const mangas = fetchival('/api/mangas')
const image = fetchival('/api/image', { responseAs: 'text' })

export function fetchMangaList ({ commit }) {
  return mangas.get()
  .then((mangaList) => {
    commit('SET_MANGA_LIST', mangaList)
  }).catch((err) => {
    commit('ERROR_REQUEST', err)
  })
}

export function viewManga ({ commit, state }, id) {
  commit('SET_MANGA', find(state.mangaList, { _id: id }))
  commit('START_REFRESH_MANGA', id)
  return mangas(id).get()
  .then((manga) => {
    commit('SET_MANGA', manga)
    commit('UPDATE_MANGA', manga)
    commit('END_REFRESH_MANGA', id)
  }).catch((err) => {
    commit('END_REFRESH_MANGA', id)
    commit('ERROR_REQUEST', err)
  })
}

export function fetchManga ({ commit }, id) {
  commit('START_REFRESH_MANGA', id)
  return mangas(id).get()
    .then((manga) => {
      commit('UPDATE_MANGA', manga)
      commit('END_REFRESH_MANGA', id)
    }).catch((err) => {
      commit('END_REFRESH_MANGA', id)
      commit('ERROR_REQUEST', err)
    })
}

export function resetDownloadProgress ({ commit }, id) {
  commit('DOWNLOAD_SET_PROGRESS', { id, progress: 0 })
}

export function setDownloadProgress ({ commit }, id, progress) {
  commit({
    type: 'DOWNLOAD_SET_PROGRESS',
    silent: true,
    payload: { id, progress }
  })
}

export function downloadChapter ({ commit }, { _id, pages, name }) {
  let imagesPromises = []
  let images = []
  const chapterId = `${name} ${_id}`
  chapterId
  // downloadButton.start()
  let counter = 0
  const total = pages.length * 2
  pages.forEach((page, i) => {
    imagesPromises.push(
      image.get({ url: page })
      .then((encodedImage) => {
        const image = {
          data: encodedImage,
          format: null
        }
        images[i] = image
        return new Promise((resolve) => {
          const img = new Image()
          img.onload = () => {
            image.format = img.width > img.height ? ['a3', 'l'] : ['a4', 'p']
            console.log(++counter / total)
            // setDownloadProgress({ commit }, chapterId, ++counter / total)
            resolve()
          }
          img.src = image.data
        })
      }).catch((err) => {
        commit('ERROR_REQUEST', err)
        // downloadButton.fail()
      })
    )
  })

  return Promise.all(imagesPromises).then(() => {
    const pdf = new Pdf()
    let p = nextTick()
    images.forEach((image, i) => {
      p = p.then(() => {
        if (i > 0) {
          pdf.addPage.apply(pdf, image.format)
        }
        pdf.addImage(image.data, 0, 0, image.format[1] === 'l' ? 420 : 210, 297)

        // setDownloadProgress({ commit }, chapterId, ++counter / total)
        console.log(++counter / total)
        // using nextTick doesn't work
        return timeout(0)
      })
    })
    p.then(() => {
      pdf.save(name + '.pdf')
    }).catch((err) => {
      commit('ERROR', err)
      // downloadButton.fail()
    })
  })
}
