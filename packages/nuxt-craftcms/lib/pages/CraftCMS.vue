<template>
  <main>
    <component
      :is="template"
      v-bind="page && page.data ? page.data : page"
      :uri="$route.path"
      @load-next-page="handleLoadNextPage"
    />
    <lazy-load
      v-for="(page, index) in pages"
      :id="page.id"
      :key="index"
      :uri="page.uri"
      :page-type="pageType"
      @load-next-page="handleLoadNextPage"
    />
    <a
      v-if="showEditBtn && !isPreview && editUrl"
      :href="editUrl"
      class="craftcms-edit-btn"
    >
      Edit
    </a>
  </main>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import PageMixin from '../mixins/page'
import templates from '~/nuxt-craftcms/load-templates'

import { debounce } from '~/utils/debounce'

export const isElementInViewport = (el, offset = 0) => {
  const rect = el.getBoundingClientRect()

  return rect.bottom > 0 &&
      rect.right > 0 &&
      rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
      rect.top < (window.innerHeight - offset || document.documentElement.clientHeight - offset)
}

@Component({
  components: {
    'lazy-load': () => import('../components/LazyLoad.vue')
  }
})
export default class CraftCMS extends mixins(PageMixin) {
  templates: any = templates

  get template () {
    const template = this.templates[this.pageType] ? this.templates[this.pageType] : null

    if (!template) {
      console.warn('No template found') // eslint-disable-line no-console
    }

    return template
  }

  pages: any[] = []
  lazyload: boolean = false

  handleLoadNextPage (page) {
    // If it's preview screen, return
    if (this.isPreview) {
      return
    }

    if (Array.isArray(page)) {
      // Find page not in already loaded
      page = page.find(p => !this.$store.getters['craftcms/lazyloadIgnoreIds'].includes(p))
    }

    if (!page) {
      return
    }

    this.pages.push(page)

    // Emit an event for tracking
    this.$emit('page-view', page.uri)

    // Add event listener
    if (!this.lazyload) {
      window.addEventListener('scroll', debounce(this.handleScroll, 250))
      this.lazyload = true
    }
  }

  get isPreview () {
    return this.$route.query['x-craft-preview'] || this.$route.query['x-craft-live-preview']
  }

  handleScroll () {
    // Find closest page
    const currentPage = this.$children.find((page) => {
      return isElementInViewport(page.$el)
    })

    if (currentPage) {
      // Update URL
      window.history.replaceState(
        {},
        '',
        currentPage.$attrs.uri
      )
    }
  }
}
</script>

<style lang="scss">
.craftcms-edit-btn {
  position: fixed;
  bottom: 0;
  right: 0;
  font-size: 14px;
  background: #E5422B;
  color: white;
  padding: 8px 15px;
  font-weight: bold;
  text-decoration: none;
  z-index: 1;

  @media print {
    display: none;
  }
}
</style>
