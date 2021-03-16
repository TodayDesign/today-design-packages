import { craftcms } from '@todaydesign/nuxt-craftcms/dist/core'
import apolloClient from '@todaydesign/nuxt-craftcms/dist/core/apollo'

export default async ({ env, app, req, res, store , route}, inject) => {

  const options = <%= serialize(options) %>

  const client = apolloClient(options)
  const craftcmsService = craftcms(client, options)

  if (options.search.indeces) {
    craftcmsService.createSearchIndeces()
  }

  inject('craftcms', craftcmsService)

   // Register CraftCMS Vuex module
   if (store) {
    const storeModule = {
      namespaced: true,
      state: () => ({
        appBaseUrl: options.appBaseUrl,
        productionUrl: options.productionUrl,
        siteName: options.siteName,
        currentURL: '',
        editURL: '',
        lazyloadIgnoreIds: []
      }),
      getters: {
        appBaseUrl (state) {
          return state.appBaseUrl
        },
        productionUrl (state) {
          return state.productionUrl
        },
        siteName (state) {
          return state.siteName
        },
        currentURL (state) {
          return state.currentURL
        },
        editURL (state) {
          return state.editURL
        },
        lazyloadIgnoreIds (state) {
          return state.lazyloadIgnoreIds
        }
      },
      mutations: {
        setSiteName (state, payload) {
          state.siteName = payload
        },
        setCurrentURL (state, payload) {
          state.currentURL = payload
        },
        setEditURL (state, payload) {
          state.editURL = payload
        },
        setLazyloadIgnoreIds (state, payload) {
          if (payload) {
            state.lazyloadIgnoreIds.push(payload)
            return
          }

          state.lazyloadIgnoreIds = []
        }
      },
      actions: {
        updateURL ({ commit }, payload) {
          commit('setCurrentURL', payload)
          commit('setLazyloadIgnoreIds')
        },
        updateEditURL ({ commit }, payload) {
          commit('setEditURL', payload)
        },
        lazyload ({ commit }, payload) {
          commit('setLazyloadIgnoreIds', payload)
        }
      }
    }

    // In SSR, Vuex regiseter store module on both server side and client side.
    // That causes the moudle store states will be reset in client side.
    // Use `{ preserveState: true }` to skip reset states when register module.
    // https://github.com/vuejs/vuex/issues/1130
    // https://vuex.vuejs.org/guide/modules.html#dynamic-module-registration
    store.registerModule('craftcms', storeModule, { preserveState: !!store.state.craftcms })
  }
}
