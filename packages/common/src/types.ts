

export type GenericMongodbObject<T> = {
  _id: T
  [key: string]: string | number | boolean | Object | any[]
}
