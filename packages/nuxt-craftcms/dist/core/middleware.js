import gql from 'graphql-tag';
import mappingFilters from './mapping-filters';
import 'url-search-params-polyfill';
export default async function (context) {
    const options = context.app.$craftcms.options;
    const client = context.app.$craftcms.apolloClient;
    const entryTypes = context.app.$craftcms.entryTypes;
    let apolloContext = null;
    let uri = context.route.path === '/'
        ? '__home__'
        : context.route.path.replace(/^\/+/, '').replace(/\/$/, '');
    let token;
    // Set site context
    context.site = options.siteHandle;
    if (process.server) {
        const params = new URLSearchParams(context.ssrContext?.req?.url || '');
        token = params.get('token') || '';
    }
    else {
        // @ts-ignore
        token = context.route.query?.token;
    }
    // Check if preview URL
    if (token) {
        // Add token param to API endpoint
        apolloContext = {
            uri: `${options.baseUrl}${options.graphqlEndpoint}?token=${token}`
        };
    }
    // Check if paginated page
    if (RegExp(/\/page\//).test(uri)) {
        // Add page param to route context
        context.route.params.page = Number(uri.split('/').pop()).toString();
        // Update URI to index page
        uri = uri.split('/page/')[0];
    }
    const standardFields = `
    title
    rawTitle: title
    __typename
    uri
    seo {
      title
      description
      keywords
      social {
        title
        description
        image {
          src
        }
      }
      noindex
      nofollow
    }
    slug
  `;
    try {
        const response = await client.query({
            query: gql `
        query ($uri: [String] $site: [String]) {
          entries(uri: $uri, site: $site) {
            ${standardFields}
            url
            sectionHandle
            id: sourceId
          }
          categories(uri: $uri, site: $site) {
            ${standardFields}
            url
            groupHandle
            id
          }
        }
      `,
            variables: {
                uri,
                site: context.site
            },
            context: apolloContext
        });
        // Page logic
        const page = response.data.entries.length || response.data.categories.length ? response.data.entries[0] || response.data.categories[0] : null;
        context.page = page ?? null;
        context.pageType = page ? page.__typename : 'error';
        context.errorType = page ? null : 404;
        // Store current URL
        context.store.dispatch('craftcms/updateURL', context.page ? context.page.url : '');
        // Add to ignore in lazyload
        if (context.page) {
            context.store.dispatch('craftcms/lazyload', context.page.id);
        }
        // Store the edit URL
        if (page) {
            const baseUrl = options.baseUrl.replace('api', 'craftcms').match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img);
            if (response.data.entries.length) {
                context.store.dispatch('craftcms/updateEditURL', `${baseUrl}/admin/entries/${page.sectionHandle}/${page.id}-${page.slug}`);
            }
            else if (response.data.categories.length) {
                context.store.dispatch('craftcms/updateEditURL', `${baseUrl}/admin/categories/${page.groupHandle}/${page.id}-${page.slug}`);
            }
        }
        // Check if paginated route
        if (options.paginatedRoutes?.find(route => route.uri === uri)) {
            // Attach per page attribute to context
            context.perPage = options.paginatedRoutes.find(route => route.uri === uri)?.perPage;
        }
        // Check if pagination route for category
        if (page && page.groupHandle && options.paginatedRoutes.find(route => route.category === page.groupHandle)) {
            // Attach per page attribute to context
            context.perPage = options.paginatedRoutes.find(route => route.category === page.groupHandle)?.perPage;
        }
        // Get page data
        if (!entryTypes[context.pageType]) {
            throw new Error(`No config found for ${context.pageType}`);
        }
        const { default: config } = await entryTypes[context.pageType]();
        if (config && config.query) {
            let apolloVars = {};
            if ('variables' in config) {
                if (typeof config.variables === 'function') {
                    apolloVars = config.variables(context);
                }
                else {
                    apolloVars = config.variables;
                }
            }
            const pageResponse = await client.query({
                query: config.query,
                variables: apolloVars,
                context: apolloContext
            });
            // Log out raw page data for easier dev
            if (process.client && process.env.NODE_ENV === 'development') {
                console.log('Page data:', pageResponse.data); // eslint-disable-line no-console
            }
            if (config.mapping) {
                const filters = Object.assign(mappingFilters(context), config.filters);
                pageResponse.data = await config.mapping(pageResponse.data, filters, context);
            }
            if (config.redirect) {
                context.page.redirect = config.redirect;
            }
            context.page.data = pageResponse.data;
        }
    }
    catch (error) {
        console.warn(error); // eslint-disable-line no-console
        context.page = {};
        context.pageType = 'error';
        context.errorType = context.errorType ? context.errorType : 400;
    }
    return context;
}
