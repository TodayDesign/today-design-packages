import {NuxtContext} from "../types";

export default (context: NuxtContext) => ({
  options: context.app.$craftcms.options,

  // Deep access to properties
  get (obj: any, ...props: string[]): any {
    return obj && props.reduce(
      (result, prop) => result == null ? undefined : result[prop],
      obj
    )
  },

  // Remove hostname
  getPathName (str: string) : string {
    if (!str) {
      return ''
    }

    return str.replace(this.options.appBaseUrl, '')
  },

  // Add beginning and trailing slash
  formatURI (str: string) : string {
    return `/${str}/`
  }
})
