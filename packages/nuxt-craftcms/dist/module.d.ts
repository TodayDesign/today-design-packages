import { Module } from '@nuxt/types';
declare module 'vue/types/vue' {
    interface Vue {
        $craftcms: any;
    }
}
interface SearchOptions {
    apiKey: string;
    appId: string;
    indeces: Object | null;
}
export interface Options {
    baseUrl: string;
    appBaseUrl: string;
    useProxy?: boolean;
    modules: any;
    apiToken?: string;
    graphqlEndpoint?: string;
    siteHandle?: string;
    siteName?: string;
    search?: SearchOptions;
    paginatedRoutes?: Array<Object>;
    disallowIndexing?: boolean;
    schema?: Object | null;
    productionUrl: string;
    robots?: Object;
    middleware?: Array<Function>;
    sitemap?: boolean;
    showEditBtn?: boolean;
}
export declare const defaults: Options;
declare const craftcms: Module<Options>;
export default craftcms;
