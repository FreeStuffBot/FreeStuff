import * as mongo from 'mongodb'


export default class MongoAdapter {

  public static client: mongo.MongoClient

  //

  public static connect(url: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      mongo.MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client: mongo.MongoClient) => {
        if (err) {
          reject(err)
        } else {
          MongoAdapter.client = client
          resolve(client)
        }
      })
    })
  }

  public disconnect(): void {
    MongoAdapter.client.close()
  }

}
