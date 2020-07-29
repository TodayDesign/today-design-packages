import { importIcons } from '@todaydesign/nuxt-icons/core/icons'

export default ({ store }, inject) => {

  const options = <%= serialize(options) %>

  inject('icons', importIcons())
}
