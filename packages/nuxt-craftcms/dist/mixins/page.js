var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Vue, Component } from 'nuxt-property-decorator';
import { namespace } from 'vuex-class';
import middleware from '../core/middleware';
const templates = {};
const craftcmsStore = namespace('craftcms');
let PageMixin = class PageMixin extends Vue {
    constructor() {
        super(...arguments);
        this.page = {};
        this.pageType = '';
    }
    head() {
        const image = this.page.seo && this.page.seo.social && this.page.seo.social.image ? this.page.seo.social.image.src : '';
        const description = this.page.seo && this.page.seo.description ? this.page.seo.description : `View ${this.page.rawTitle} page`;
        const title = this.page.seo ? this.page.seo.title : `${this.page.title} | ${this.siteName}`;
        const keywords = this.page.seo ? this.page.seo.keywords : '';
        const noindex = this.page.seo && this.page.seo.noindex ? 'noindex' : false;
        const nofollow = this.page.seo && this.page.seo.nofollow ? 'nofollow' : false;
        const robots = [noindex, nofollow].filter(Boolean);
        const url = this.page.url ? this.page.url.replace(this.appBaseUrl, this.productionUrl) : false;
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
        };
    }
    async asyncData(context) {
        const customMiddleware = context.app.$craftcms.options.middleware.map((func) => func(context));
        if (process.static && process.client && '$payloadURL' in context) {
            const data = await context.$axios.$get(context.$payloadURL(context.route));
            Object.assign(context, data);
        }
        else {
            await Promise.all([
                ...customMiddleware,
                middleware(context)
            ]);
        }
        // Load dymamic component so we can transition it nicely
        if (templates[context.pageType]) {
            await templates[context.pageType]();
        }
        // If redirect page, lets redirect it
        if (context.page.data && context.page.data.redirect) {
            context.redirect('301', context.page.data.redirect);
        }
        // If error, set page title
        if (context.errorType) {
            context.page.title = 'Page not found';
            context.page.error = String(context.errorType);
        }
        return {
            page: context.page,
            pageType: context.pageType,
            errorType: context.errorType,
            showEditBtn: context.app.$craftcms.options.showEditBtn,
            editUrl: context.store.getters['craftcms/editURL']
        };
    }
};
__decorate([
    craftcmsStore.Getter('appBaseUrl')
], PageMixin.prototype, "appBaseUrl", void 0);
__decorate([
    craftcmsStore.Getter('productionUrl')
], PageMixin.prototype, "productionUrl", void 0);
__decorate([
    craftcmsStore.Getter('siteName')
], PageMixin.prototype, "siteName", void 0);
PageMixin = __decorate([
    Component({})
], PageMixin);
export default PageMixin;
