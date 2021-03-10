import { Module } from '@nuxt/types'
import generateRoutes from './core/generate-routes'
import schemaQuery from './core/schema-query'
const path = require('path')

declare module 'vue/types/vue' {
  interface Vue {
    $craftcms: any
  }
}

interface SearchOptions {
  apiKey: String,
  appId: String,
  indeces: Object | null
}

interface Options {
  baseUrl: String,
  appBaseUrl: String,
  useProxy?: Boolean,
  modules: any,
  apiToken?: String,
  graphqlEndpoint?: String,
  siteHandle?: String,
  siteName?: String,
  search?: SearchOptions,
  paginatedRoutes?: Array<Object>,
  disallowIndexing?: Boolean
  schema?: Object | null,
  productionUrl: String,
  robots?: Object,
  middleware?: Array<Function>,
  sitemap?: Boolean,
  showEditBtn? : Boolean
}

export const defaults: Options = {
  baseUrl: '',
  useProxy: false,
  appBaseUrl: '',
  modules: {},
  apiToken: '',
  graphqlEndpoint: '/api',
  siteHandle: 'default',
  siteName: '',
  search: {
    apiKey: '',
    appId: '',
    indeces: null
  },
  paginatedRoutes: [],
  disallowIndexing: false,
  schema: null,
  productionUrl: '',
  robots: {
    UserAgent: '*',
    Disallow: ''
  },
  middleware: [],
  sitemap: true,
  showEditBtn: false
}

const craftcms: Module<Options> = async function (moduleOptions) {
  const options = Object.assign(defaults, this.options.craftcms, moduleOptions)
  options.mode = this.options.mode
  options.contentBaseUrl = options.useProxy ? options.appBaseUrl : options.baseUrl

  // Write schema
  try {
    options.schema = await schemaQuery(options)
  } catch (err) {
    console.warn('Unable to generate schema', err)
    options.schema = require('../schema.json')
  }

  // Set up proxy
  if (options.useProxy) {
    this.options.proxy = { ...this.options.proxy }
    this.options.proxy[`${options.graphqlEndpoint}`] = options.baseUrl
    this.addModule('@nuxtjs/proxy', true)
  }

  // Add axios
  this.addModule(['@nuxtjs/axios', {
    debug: false,
    proxy: true
  }])

  // Load custom modules
  Object.keys(options.modules).forEach((customModuleKey) => {
    const customModule = options.modules[customModuleKey]

    if (typeof customModule === 'function') {
      customModule.call(this)
    }
  })

  // Register `plugin.js` template
  this.addPlugin({
    src: path.resolve(__dirname, 'templates/plugin.ts'),
    fileName: 'craftcms.js',
    options
  })

  // Extends routes to add CMS wildcard route, routes added under /pages will still take precedence
  this.extendRoutes((routes, resolve) => {
    routes.push(
      {
        name: 'craftcms',
        path: '*',
        component: resolve(__dirname, './pages/CraftCMS.vue')
      },
      {
        name: 'craftcms-admin',
        path: '/admin/*',
        alias: '/setpassword/*',
        component: resolve(__dirname, './pages/CraftCMSAdmin.vue')
      }
    )
  })

  // Generate static routes from GraphQL
  if (options.mode === 'universal') {
    this.nuxt.hook('generate:extendRoutes', async (routes) => {
      try {
        const staticRoutes: Array<any> = await generateRoutes(options)
        const payload = {
          cacheStamp: Date.now()
        }

        // Add to routes
        staticRoutes.forEach(route =>
          routes.push({
            route: route.uri === '__home__' ? '/' : `/${route.uri}`,
            payload
          })
        )

        // Create 404 page
        routes.push({
          route: '/404',
          payload
        })

        return routes
      } catch (error) {
        console.log(error)
        throw error
      }
    })
  }

  // Generate site map
  if (options.sitemap) {
    this.addModule(['@nuxtjs/sitemap', {
      hostname: options.productionUrl,
      routes: async () => {
        try {
          const routes: Array<any> = await generateRoutes(options)
          return routes.map(route => route.uri === '__home__' ? '/' : `/${route.uri}/`)
        } catch (err) {
          console.warn('Sitemap not generated', err)
        }
      }
    }])
  }

  // Redirect activation emails

  const robots = options.disallowIndexing ? {
    UserAgent: '*',
    Disallow: '/'
  } : options.robots

  // Generate robots.txt
  this.addModule(['@nuxtjs/robots', robots])
}

export default craftcms
