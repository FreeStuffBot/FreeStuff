/* eslint-disable camelcase */
import { Const, LanguageDataType, ProductDataType, SanitizedProductType } from '@freestuffbot/common'
import paparsya from 'paparsya'
import { Router, Request, Response } from 'express'
import Mongo from '../../database/mongo'
import { ProductFlag } from '@freestuffbot/common/dist/types/other/product-flag'
import CurrConv from '../../services/currconv'
import Thumbnailer from '../../services/thumbnailer'


export const router: Router = Router()

//

// TODO(medium) re-map new ProductType to old GameData object
function getInfo(field: string) {
  return async (req: Request, res: Response) => {
    if (!req.params?.id)
      return res.status(400).json({ success: false, error: 'Bad Request', message: 'Missing or invalid game id.', data: {} })

    const idsraw = req.params.id.split('+')
    const idsint = idsraw.map(id => parseInt(id))
    if (idsraw.length > 5)
      return res.status(400).json({ success: false, error: 'Bad Request', message: 'You may only request up to 5 ids in one request.', data: {} })

    const langs: LanguageDataType[] | null = req.query.lang
      ? await Mongo.Language
        .find(req.query.lang === '@all'
          ? { _index: { $gte: 0 }, _enabled: true }
          : { _id: { $in: [ 'en-US', ...`${req.query.lang}`.split(' ') ] } })
        .lean(true)
        .exec()
      : null

    fetch(idsint)
      .then(async (games) => {
        const out = <any> {}
        for (const id of idsraw) {
          out[id] = games.find(g => g?.id === parseInt(id)) || null
          if (!out[id]) continue

          if (typeof out[id].info.thumbnail === 'string')
            out[id].info.thumbnail = await Thumbnailer.generateObject({ thumbnail: out[id].info.thumbnail }, true)

          generateUrls(out[id].info)

          fillInPrices(out[id].info.org_price)
          fillInPrices(out[id].info.price)

          if (field && out[id]) out[id] = out[id][field]
          if (langs) out[id].localized = localize(out[id], langs)
        }

        console.log(out)
        res.status(200).json({ success: true, data: out })
      })
      .catch(() => res.status(502).json({ success: false, error: 'Bad Gateway', message: 'Connection to database failed.', data: {} }))
  }
}

function fillInPrices(obj: any) {
  obj.dollar = obj.usd

  obj.gbp = CurrConv.convert(obj.usd, 'GBP')
  obj.brl = CurrConv.convert(obj.usd, 'BRL')
  obj.bgn = CurrConv.convert(obj.usd, 'BGN')
  obj.pln = CurrConv.convert(obj.usd, 'PLN')
  obj.huf = CurrConv.convert(obj.usd, 'HUF')
  obj.btc = CurrConv.convert(obj.usd, 'BTC')
}

function localize(game: SanitizedProductType, langs: any) {
  const out = {} as any
  const fallback = langs.find((l: any) => (l._id === 'en-US'))

  const date = game.until ? new Date(game.until * 1000) : null
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
      game.prices.find(p => p.currency === 'eur').oldValue,
      game.prices.find(p => p.currency === 'usd').oldValue
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
      org_price_eur: get('currency_sign_euro_position') === 'before' ? `€${priceEur}` : `${priceEur}€`,
      org_price_usd: get('currency_sign_dollar_position') === 'before' ? `$${priceUsd}` : `${priceUsd}$`,
      org_price_dollar: get('currency_sign_dollar_position') === 'before' ? `$${priceUsd}` : `${priceUsd}$`,
      until: date ? paparsya(get('announcement_free_until_date'), { date: date.toLocaleDateString(get('date_format')) }) : null,
      until_alt,
      flags
    }
  }
  return out
}

function generateUrls(object: SanitizedProductType & { urls: any, org_url: string }) {
  if (!object.urls) {
    object.urls = {
      default: object.org_url,
      browser: object.org_url,
      org: object.org_url
    }
  }

  const isSteamUrl = /^https?:\/\/store\.steampowered\.com\/app\/.*/g.test(object.urls.org)
  if (isSteamUrl) {
    try {
      const id = object.urls.org.split('/app/')[1].split('/')[0]
      object.urls.client = `steam://store/${id}`
    } catch (ex) {
      console.info(`Failed creating the client url for steam with url ${object.urls.org} for reason:`)
      console.log(ex)
    }
  }

  const isEpicUrl = /^https?:\/\/(www\.)?epicgames\.com\/store\/.*$/g.test(object.urls.org)
  if (isEpicUrl) {
    try {
      const data = object.urls.org.split('/store/')[1].replace('/en-US', '').replace(/\/home$/, '').split('?')[0]
      object.urls.client = `com.epicgames.launcher://store/${data}`
    } catch (ex) {
      console.info(`Failed creating the client url for epic games with url ${object.urls.org} for reason:`)
      console.log(ex)
    }
  }
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

  // const inc = <any> {}
  // const parse = (obj: any, prefix: string) => {
  //   if (!obj) return
  //   for (const key of Object.keys(obj)) {
  //     if (typeof obj[key] === 'number') inc[`${prefix}.${key}`] = obj[key]
  //     else parse(obj[key], `${prefix}.${key}`)
  //   }
  // }
  // parse(req.body.data, `analytics.${req.body.service}`)

  // // eslint-disable-next-line no-unused-expressions
  // const product: ProductType = await Mongo.Product.findById(parseInt(req.params.id))
  // if (!product) {
  //   res.status(500).json({ success: false, error: 'Internal Server Error', message: 'Something went wrong. Either bad gateway or bad payload.' })
  //   return
  // }

  // Database
  //   .collection('games')
  //   ?.updateOne(
  //     { _id: parseInt(req.params.id) },
  //     { $inc: inc }
  //   )
  //   .then(() => )
  //   .catch(() => )
}

//

router.get('/:id/info', getInfo('info'))
// router.get('/:id/analytics', partnerRequestsOnly, getInfo('analytics'))
// router.get('/:id/all', partnerRequestsOnly, getInfo(''))
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
