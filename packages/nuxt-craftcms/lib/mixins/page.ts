import { Vue, Component } from 'nuxt-property-decorator'
import { namespace } from 'vuex-class'
import middleware from '../core/middleware'
const templates: any = {}

const craftcmsStore = namespace('craftcms')

@Component({})
export default class PageMixin extends Vue {
  page: any = {}
  pageType: string = ''

  @craftcmsStore.Getter('appBaseUrl')
  appBaseUrl!: string

  @craftcmsStore.Getter('productionUrl')
  productionUrl!: string

  @craftcmsStore.Getter('siteName')
  siteName!: string

  head () {
    const image = this.page.seo && this.page.seo.social && this.page.seo.social.image ? this.page.seo.social.image.src : ''
    const description = this.page.seo && this.page.seo.description ? this.page.seo.description : `View ${this.page.rawTitle} page`
    const title = this.page.seo ? this.page.seo.title : `${this.page.title} | ${this.siteName}`
    const keywords = this.page.seo ? this.page.seo.keywords : ''
    const noindex = this.page.seo && this.page.seo.noindex ? 'noindex' : false
    const nofollow = this.page.seo && this.page.seo.nofollow ? 'nofollow' : false
    const robots = [noindex, nofollow].filter(Boolean)
    const url = this.page.url ? this.page.url.replace(this.appBaseUrl, this.productionUrl) : false

    return {
      title: this.page.seo ? this.page.seo.title : `${this.page.title} | ${this.siteName}`,
      meta: [
        { hid: 'keywords', name: 'keywords', content: keywords },
        { hid: 'description', name: 'description', content: description },

        // Open Graph
        { hid: 'og:site_name', name: 'og:site_name', content: this.siteName },
        { hid: 'og:title', name: 'og:title', content: title },
        { hid: 'og:description', name: 'og:description', content: description },
        { hid: 'og:type', name: 'og:type', content: 'website' },
        { hid: 'og:url', name: 'og:url', content: url },
        { hid: 'og:image', name: 'og:image', content: image },

        // Twitter
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary' },
        { hid: 'twitter:title', name: 'twitter:title', content: title },
        { hid: 'twitter:description', name: 'twitter:description', content: description },
        { hid: 'twitter:image', name: 'twitter:image', content: image },
        robots.length ? { hid: 'robots', name: 'robots', content: robots.join(',') } : false
      ].filter(Boolean),
      link: [
        {
          rel: 'canonical',
          href: url
        }
      ]
    }
  }

  async asyncData (context: any) {
    const customMiddleware = context.app.$craftcms.options.middleware.map((func: Function) => func(context))

    if (process.static && process.client && '$payloadURL' in context) {
      const data = await context.$axios.$get(context.$payloadURL(context.route))
      Object.assign(context, data)
    } else {
      await Promise.all([
        ...customMiddleware,
        middleware(context)
      ])
    }

    // Load dymamic component so we can transition it nicely
    if (templates[context.pageType]) {
      await templates[context.pageType]()
    }

    // If redirect page, lets redirect it
    if (context.page.data && context.page.data.redirect) {
      context.redirect('301', context.page.data.redirect)
    }

    // If error, set page title
    if (context.errorType) {
      context.page.title = 'Page not found'
      context.page.error = String(context.errorType)
    }

    return {
      page: context.page,
      pageType: context.pageType,
      errorType: context.errorType,
      showEditBtn: context.app.$craftcms.options.showEditBtn,
      editUrl: context.store.getters['craftcms/editURL']
    }
  }
}
