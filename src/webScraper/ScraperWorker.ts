import { FreeStuffData } from "types";


export default abstract class ScraperWorker {

  public async abstract fetch(url: string): Promise<FreeStuffData>;

}