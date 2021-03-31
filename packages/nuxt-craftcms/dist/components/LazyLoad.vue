<template>
  <component
    :is="template"
    v-if="loaded"
    v-bind="page"
    @load-next-page="$evt => $emit('load-next-page', $evt)"
  />
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'
import templates from '~/nuxt-craftcms/load-templates'
import entryTypes from '~/nuxt-craftcms/load-queries'

@Component
export default class LazyLoad extends Vue {
  templates: any = templates

  @Prop({
    type: String,
    required: true,
    default: ''
  })
  pageType!: string

  @Prop({
    type: Number,
    required: true,
    default: 0
  })
  id!: number

  get template () {
    const template = this.templates[this.pageType] ? this.templates[this.pageType] : null

    if (!template) {
      console.warn('No template found') // eslint-disable-line no-console
    }

    return template
  }

  loaded: boolean = false
  page: any = {}

  async mounted () {
    const client = this.$craftcms.apolloClient
    const { default: config } = await entryTypes[this.pageType]()

    try {
      const { data } = await client.query({
        query: config.query,
        variables: {
          id: Number(this.id)
        }
      })

      // Add to store
      this.$store.dispatch('craftcms/lazyload', this.id)

      this.page = await config.lazyload(data, client, this.$store.getters['craftcms/lazyloadIgnoreIds'])
      this.loaded = true
    } catch (err) {
      console.warn(err) // eslint-disable-line no-console
    }
  }
}
</script>
