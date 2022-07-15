import { GraphQLClient } from 'graphql-request'
import { config } from '../..'
import GibuGqlQueries from './gibu-gql-queries'


export default class GibuGqlCore {

  private static client: GraphQLClient = null

  public static connect() {
    GibuGqlCore.client = new GraphQLClient(config.thirdparty.gibu.gqlUri)
  }

  public static async query<T>(query: GibuGqlQueries<T>, variables: Record<string, any>): Promise<T | null> {
    const res = await GibuGqlCore.client
      .request({ document: query.compiledQuery, variables })
      .catch(() => null)

    return res
      ? (<unknown> res[query.functionName] as T)
      : null
  }

}
