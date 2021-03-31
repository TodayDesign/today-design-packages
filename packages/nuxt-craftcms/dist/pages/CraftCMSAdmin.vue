<template>
  <main class="container">
    Redirecting to admin panel...
  </main>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class CraftCMSAdmin extends Vue {
  middleware ({ app, redirect, route }) {
    const options = app.$craftcms.options

    return redirect('301', options.baseUrl + route.fullPath)
  }
}
</script>
