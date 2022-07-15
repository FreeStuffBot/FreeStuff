import { gql } from 'graphql-request'
import { DocumentNode } from 'graphql'


export default class GibuGqlQueries<T> {

  public readonly compiledQuery: DocumentNode

  constructor(
    public readonly query: string,
    public readonly functionName: string
  ) {
    this.compiledQuery = (gql as any)([ this.query ])
  }

  public get type(): T {
    return null
  }

  //

  public static PRODUCT_DETAILS = new GibuGqlQueries<
    {
      uuid: string
      store: string
      title: string
      kind: string
      tags: string[]
      prices: {
        currency: string
        initial: number
        final: number
      }[]
      descriptionShort: string
      ratings: {
        score: number
      }[]
      images: {
        name: string
        url: string
      }[]
      sale: {
        until: number
        type: string
      }
      storeMeta: {
        steamSubids?: string
      }
    }
  >(`
  query ProductDetails($url: String!) {
    gamePageDetails(url: $url) {
      uuid
      store
      title
      kind
      tags
      prices {
        currency
        initial
        final
      }
      descriptionShort
      ratings {
        score
      }
      images {
        name
        url
      }
      sale {
        until
        type
      }
      storeMeta {
        steamSubids
      }
    }
  }
  `, 'gamePageDetails')

  //

  public static FREE_GAMES_LIST = new GibuGqlQueries<
    {
      items: {
        uuid: string
        url: string
        type: string
        store: string
      }[]
    }
  >(`
  query FreeGamesList {
    gameList(id: "free") {
      items {
        uuid
        url
        type
        store
      }
    }
  }
  `, 'gameList')

}
