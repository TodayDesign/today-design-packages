import {Context} from "@nuxt/types";
import { IntrospectionResultData } from 'apollo-cache-inmemory'

declare module 'vue/types/vue' {
    interface Vue {
        $craftcms: any
    }
}

export interface NuxtContext extends Context {
    site?: string;
    page: any;
    pageType: string;
    errorType: number | null;
    perPage?: number;
}

interface SearchOptions {
    apiKey: string,
    appId: string,
    indeces: Object | null
}

export interface Options {
    baseUrl: string,
    appBaseUrl: string,
    contentBaseUrl: string,
    useProxy?: boolean,
    modules: any,
    apiToken?: string,
    graphqlEndpoint?: string,
    siteHandle?: string,
    siteName?: string,
    search?: SearchOptions,
    paginatedRoutes: PaginatedRoute[],
    disallowIndexing?: boolean
    schema: IntrospectionResultData | null,
    productionUrl: string,
    robots?: Object,
    middleware?: Array<Function>,
    sitemap?: boolean,
    showEditBtn? : boolean
}


export interface PaginatedRoute {
    name: string;
    category: string;
    uri: string;
    perPage: number;
}

