/* eslint-disable camelcase */
import { Const, LanguageDataType, Logger, ProductDataType, SanitizedProductType } from '@freestuffbot/common'
import paparsya from 'paparsya'
import { Router, Request, Response } from 'express'
import { ProductFlag } from '@freestuffbot/common/dist/types/other/product-flag'
import Mongo from '../../database/mongo'


export const router: Router = Router()

//

function getInfo() {
  return async (req: Request, res: Response) => {
    if (!req.params?.id)
      return res.status(400).json({ success: false, error: 'Bad Request', message: 'Missing or invalid game id.', data: {} })

    const idsraw = req.params.id.split('+')
    if (idsraw.length > 5)
      return res.status(400).json({ success: false, error: 'Bad Request', message: 'You may only request up to 5 ids in one request.', data: {} })
    const idsint = idsraw.map(id => parseInt(id))

    const langs: LanguageDataType[] | null = req.query.lang
      ? await Mongo.Language
        .find(req.query.lang === '@all'
          ? { _index: { $gte: 0 }, _enabled: true }
          : { _id: { $in: [ 'en-US', ...`${req.query.lang}`.split(' ').slice(0, 25) ] } })
        .lean(true)
        .exec()
      : null

    fetch(idsint)
      .then((games) => {
        const out = <any> {}
        for (const id of idsint) {
          out[id] = games.find(g => g?.id === id) || null
          if (!out[id]) continue

          // if (typeof out[id].info.thumbnail === 'string')
          //   out[id].info.thumbnail = await Thumbnailer.generateObject({ thumbnail: out[id].info.thumbnail }, true)

          // generateUrls(out[id].data)

          if (langs) out[id].localized = localize(out[id], langs)

          mapToOldStruct(out[id])
        }

        res.status(200).json({ success: true, data: out })
      })
      .catch((err) => {
        Logger.warn('Handled error occured at /v1/game')
        // eslint-disable-next-line no-console
        console.error(err)
        res.status(502).json({ success: false, error: 'Bad Gateway', message: 'Connection to database failed.', data: {} })
      })
  }
}

function mapToOldStruct(data: any) {
  delete data._id
  delete data.staffApproved

  //

  data.price = {}
  data.org_price = {}

  for (const price of data.prices) {
    data.price[price.currency] = price.newValue / 100
    data.org_price[price.currency] = price.oldValue / 100
  }

  data.price.euro = data.price.eur
  data.org_price.euro = data.org_price.eur
  data.price.dollar = data.price.usd
  data.org_price.dollar = data.org_price.usd

  delete data.prices

  //

  data.url = data.urls.default ?? data.urls.org
  data.org_url = data.urls.org
  delete data.urls._id

  //

  data.thumbnail = data.thumbnails
  delete data.thumbnail._id
  delete data.thumbnails

  //

  data.store = data.platform
  delete data.platform

  //

  data.type = (data.type === 'keep' ? 'free' : 'unknown')

  //

  data.until = ~~(data.until / 1000)

  //

  data.store_meta = {
    steam_subids: data.platformMeta?.steamSubids ?? ''
  }
  delete data.platformMeta
}

function localize(game: SanitizedProductType, langs: any) {
  const out = {} as any
  const fallback = langs.find((l: any) => (l._id === 'en-US'))

  const date = game.until ? new Date(game.until) : null
  const days = date ? Math.round(Math.abs((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : null

  for (const l of langs) {
    const get = (key: string) => (l[key] || fallback[key])

    const flags = []
    if ((game.flags & ProductFlag.TRASH) !== 0) flags.push(get('game_meta_flag_trash'))
    if ((game.flags & ProductFlag.THIRDPARTY) !== 0) flags.push(get('game_meta_flag_thirdparty'))

    let until_alt = date ? get('announcement_free_for_a_long_time') : null
    if (date && days) {
      const day = date.toLocaleDateString(get('date_format'), { weekday: 'long' })
      if (days < 7) until_alt = paparsya(get('announcement_free_until_day'), { day })
      else if (days === 7) until_alt = paparsya(get('announcement_free_for_a_week'), { day })
      else if (days < 14) until_alt = paparsya(get('announcement_free_until_day_next_week'), { day })
    }

    const [ priceEur, priceUsd ] = [
      game.prices.find(p => p.currency === 'eur')?.oldValue ?? 1999,
      game.prices.find(p => p.currency === 'usd')?.oldValue ?? 1999
    ]

    out[l._id] = {
      lang_name: get('lang_name'),
      lang_name_en: get('lang_name_en'),
      lang_flag_emoji: get('lang_flag_emoji'),
      platform: get('platform_' + game.platform),
      claim_long: get('announcement_button_text'),
      claim_short: 'GET',
      free: get('announcement_pricetag_free'),
      header: get('announcement_header'),
      footer: paparsya(get('announcement_footer'), { website: Const.links.websiteClean }),
      org_price_eur: get('currency_sign_position') === 'before' ? `€${priceEur/100}` : `${priceEur/100}€`,
      org_price_usd: get('currency_sign_position') === 'before' ? `$${priceUsd/100}` : `${priceUsd/100}$`,
      org_price_dollar: get('currency_sign_position') === 'before' ? `$${priceUsd/100}` : `${priceUsd/100}$`,
      until: date ? paparsya(get('announcement_free_until_date'), { date: date.toLocaleDateString(get('date_format')) }) : null,
      until_alt,
      flags
    }
  }
  return out
}

//

const handleBadRequest = (message: string) => {
  return (_req: Request, res: Response) => res.status(400).json({ success: false, error: 'Bad Request', message })
}

//

function postAnalytics(req: Request, res: Response) {
  if (!req.body || !req.body.service || !req.body.suid || !req.body.data)
    return handleBadRequest('Invalid request body')(req, res)

  if (!parseInt(req.params.id) || isNaN(parseInt(req.params.id)))
    return handleBadRequest('Invalid game id')(req, res)

  res.status(200).json({ success: true })
}

//

router.get('/:id/info', getInfo())
router.get('/:id/*', handleBadRequest('Invalid lookup property.'))
router.get('/:id', handleBadRequest('Missing lookup property.'))
router.get('/', handleBadRequest('Missing game id.'))
router.post('/:id/analytics', postAnalytics)

//

async function fetch(ids: number[]): Promise<(SanitizedProductType | null)[]> {
  if (ids.length === 1) {
    const raw: ProductDataType = await Mongo.Product
      .findById(ids[0])
      .lean(true)
      .exec() as any
    return [ raw?.data ]
  } else {
    const raw: ProductDataType[] = await Mongo.Product
      .find({ _id: { $in: ids } })
      .lean(true)
      .exec() as any
    return raw.map(r => r?.data)
  }
}
