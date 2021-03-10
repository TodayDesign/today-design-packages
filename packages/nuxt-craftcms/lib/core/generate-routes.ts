const axios = require('axios')

export default async function (options) {
  let routes: Array<{uri: string}> = []
  const headers = options.apiToken ? {
    authorization: options.apiToken ? `Bearer ${options.apiToken}` : ''
  } : {}

  // Fetch all CMS routes for static site
  const { data } = await axios({
    method: 'POST',
    url: options.baseUrl + options.graphqlEndpoint,
    headers,
    data: {
      query: `
        query ($site: [String]) {
          entries(site: $site) {
            uri
          }
          categories(site: $site) {
            uri
          }
        }
      `,
      variables: {
        site: options.siteHandle
      }
    }
  })

  routes = [...data.data.entries, ...data.data.categories]

  // Get paginated routes
  if (options.paginatedRoutes.length) {
    const requests: Array<any> = []
    const categoryRequests: Array<any> = []
    let categories: Array<any> = []

    options.paginatedRoutes.forEach(async (section) => {
      // Fetch categories
      if (section.category) {
        // Fetch category
        const categoriesResponse = await axios({
          method: 'POST',
          url: options.baseUrl + options.graphqlEndpoint,
          headers,
          data: {
            query: `
              query ($group: [String]) {
                categories (group: $group) {
                  id
                  uri
                }
              }
            `,
            variables: {
              group: section.category
            }
          }
        })

        categories = categoriesResponse && categoriesResponse.data && categoriesResponse.data.data ? categoriesResponse.data.data.categories : []
      }

      // Fetch total entries
      if (section.uri) {
        requests.push(() => getRequest(options, headers, section))
      }

      // Fetch total entries for categories
      categories.forEach((category) => {
        categoryRequests.push({
          perPage: section.perPage,
          uri: category.uri,
          request: () => getRequest(options, headers, section, category.id)
        })
      })
    })

    const responses = await Promise.all(requests.map(request => request()))
    const categoryResponses = await Promise.all(categoryRequests.map(category => category.request()))

    responses.forEach((response, index) => {
      const count = response.data.data.entryCount
      const noOfPages = Math.ceil(count / options.paginatedRoutes[index].perPage)

      // If only 1 page, don't bother
      if (noOfPages === 1) {
        return
      }

      // Generate pages
      for (let i = 2; i <= noOfPages; i++) {
        routes.push({
          uri: `${options.paginatedRoutes[index].uri}/page/${i}`
        })
      }
    })

    categoryResponses.forEach((response, index) => {
      const count = response.data.data.entryCount
      const noOfPages = Math.ceil(count / categoryRequests[index].perPage)

      // If only 1 page, don't bother
      if (noOfPages === 1) {
        return
      }

      // Generate pages
      for (let i = 2; i <= noOfPages; i++) {
        routes.push({
          uri: `${categoryRequests[index].uri}/page/${i}`
        })
      }
    })
  }

  return routes.filter(route => route.uri)
}

const getRequest = (options, headers, section, categoryId = null) => {
  return axios({
    method: 'POST',
    url: options.baseUrl + options.graphqlEndpoint,
    headers,
    data: {
      query: `
        query(
          $section: [String],
          $relatedTo: [Int]
        ) {
          entryCount(
            section: $section,
            relatedTo: $relatedTo
          )
        }
      `,
      variables: {
        section: section.name,
        relatedTo: categoryId ? [categoryId] : null
      }
    }
  })
}
