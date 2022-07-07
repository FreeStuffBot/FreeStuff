

export type DeprecationHandler<T> = (item: T) => any

/**
 * Flipflip Cache is using two cache buckets that get swapped out every x ms.
 * On ever swap the older of the two buckets is cleared and made the new primary bucket.
 * The secondary bucket only gets accessed when the primary bucket misses.
 * Every read refreshes an item's lifespan, putting it in the primary bucket if it has not been there before.
 * A single .has check does NOT refresh an item's lifespan.
 * On every swap, the deprecation method gets called on all elements in the previous primary bucket.
 * If the interval of the cache is set to **n**:
 * - deprecation method gets called with a delay anywhere between **0-n** of the item's write
 * - the item is removed from the cache anywhere between **n-2n** from the last read
 * - after the deprecation method was called, the item stays cached for exactly **n** if not accessed any more
 * - even if constantly accessed, the deprecation method gets called at maximum every **n** for each item
 */
export default class FlipflopCache<T> {

  private collector: NodeJS.Timer
  private cacheBucketF: Map<string, T>
  private cacheBucketT: Map<string, T>
  private cacheCurrentBucket: boolean

  constructor(
    private frequency: number,
    private onDeprecate?: DeprecationHandler<T>,
    startCollector = true
  ) {
    this.cacheBucketF = new Map()
    this.cacheBucketT = new Map()
    this.cacheCurrentBucket = false

    if (startCollector)
      this.startCollector()
  }

  public startCollector(): void {
    this.stopCollector()
    this.collector = setInterval(self => self.collect(), this.frequency, this)
  }

  public stopCollector(): void {
    if (this.collector)
      clearInterval(this.collector)
  }

  private collect(): void {
    // clear the older bucket
    if (this.cacheCurrentBucket)
      this.cacheBucketF.clear()
    else
      this.cacheBucketT.clear()

    // do the flip
    this.cacheCurrentBucket = !this.cacheCurrentBucket

    // save changes in the old one
    if (this.onDeprecate) {
      if (this.cacheCurrentBucket) {
        for (const obj of this.cacheBucketF.values())
          this.onDeprecate(obj)
      } else {
        for (const obj of this.cacheBucketT.values())
          this.onDeprecate(obj)
      }
    }
  }

  //

  public put(key: string, value: T): void {
    if (this.cacheCurrentBucket)
      this.cacheBucketT.set(key, value)
    else
      this.cacheBucketF.set(key, value)
  }

  public has(key: string): boolean {
    return this.cacheBucketT.has(key) || this.cacheBucketF.has(key)
  }

  public get(key: string): T {
    if (this.cacheCurrentBucket) {
      let data = this.cacheBucketT.get(key) // not using .has because buckets might swap in between the .has and the .get call
      if (data !== undefined) return data
      data = this.cacheBucketF.get(key)
      if (data === undefined) return undefined
      this.cacheBucketT.set(key, data) // take data from older bucket into newer bucket
      return data
    } else {
      let data = this.cacheBucketF.get(key)
      if (data !== undefined) return data
      data = this.cacheBucketT.get(key)
      if (data === undefined) return undefined
      this.cacheBucketF.set(key, data)
      return data
    }
  }

  public remove(key: string, deprecate = false): void {
    if (deprecate && this.has(key))
      this.onDeprecate?.(this.get(key))

    this.cacheBucketT.delete(key)
    this.cacheBucketF.delete(key)
  }

  public clear(): void {
    this.cacheBucketF.clear()
    this.cacheBucketT.clear()
  }

  //

  public get activeSize(): number {
    if (this.cacheCurrentBucket)
      return this.cacheBucketT.size
    else
      return this.cacheBucketF.size
  }

  public get passiveSize(): number {
    if (this.cacheCurrentBucket)
      return this.cacheBucketF.size
    else
      return this.cacheBucketT.size
  }

  public get totalSize(): number {
    return this.cacheBucketT.size + this.cacheBucketF.size
  }

}
