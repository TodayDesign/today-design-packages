import { ApolloClient, ApolloLink, InMemoryCache, HttpLink } from 'apollo-boost'
import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import { Options } from "../types"

// Add fetch
require('es6-promise').polyfill()
require('isomorphic-fetch')

export default function (options: Options) {
  const httpLink = new HttpLink({ uri: options.contentBaseUrl + options.graphqlEndpoint, fetch })
  const introspectionQueryResultData = options.schema

  const fragmentMatcher = new IntrospectionFragmentMatcher({
    // @ts-ignore
    introspectionQueryResultData
  })


  const authLink = new ApolloLink((operation, forward) => {
    const headers = options.apiToken ? {
      authorization: options.apiToken ? `Bearer ${options.apiToken}` : ''
    } : {}

    // Use the setContext method to set the HTTP headers.
    operation.setContext({
      headers
    })

    // Call the next link in the middleware chain.
    return forward(operation)
  })

  return new ApolloClient({
    link: authLink.concat(httpLink), // Chain it with the HttpLink
    cache: new InMemoryCache({ fragmentMatcher })
  })
}
