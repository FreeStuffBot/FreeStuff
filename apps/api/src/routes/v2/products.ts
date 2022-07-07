import { Const, LanguageDataType, Localisation, LocalizedProductDetailsDataType, ProductDataType, ProductFlag, ProductSanitizer, SanitizedProductType } from '@freestuffbot/common'
import { Request, Response } from 'express'
import paparsya from 'paparsya'
import ReqError from '../../lib/req-error'
import Resolver from '../../lib/resolver'


export async function getProduct(req: Request, res: Response) {
  const id = req.params.product
  if (!id) return ReqError.badRequest(res, 'Invalid Product Id', 'Product Id not found.')
  if (!id.match(/^\d{1,10}$/)) return ReqError.badRequest(res, 'Invalid Product Id', 'Product Id must be a positive integer')

  const numId = parseInt(id, 10)
  if (!numId || isNaN(numId)) return ReqError.badRequest(res, 'Huh', 'Hmmmmmm')


  const data: ProductDataType = await Resolver.resolveProduct(numId)
  if (!data) return ReqError.notFound(res, `No announcement by id ${id} found!`)

  const out = ProductSanitizer.sanitize(data)
  
  if (req.query.localize) {
    const langs = (req.query.localize + '').split(' ')
    if (!langs.includes('en-US'))
      langs.push('en-US')
    const data = await Promise.all(langs.map(Resolver.resolveLanguage))
    const valid = data.filter(d => !!d)
    const localized = await localizeProduct(out, valid)
    out.localized = localized
  }

  res.status(200).json(out)
}

async function localizeProduct(product: SanitizedProductType, langs: LanguageDataType[]): Promise<LocalizedProductDetailsDataType[]> {
  const out: LocalizedProductDetailsDataType[] = []
  const fallback: LanguageDataType = langs.find((l: any) => (l._id === 'en-US'))

  const date = product.until
    ? new Date(product.until * 1000)
    : null

  for (const l of langs) {
    const t = (key: string) => (l[key] ?? fallback[key])

    const flags = []
    if ((product.flags & ProductFlag.TRASH) !== 0) flags.push(t('product_meta_flag_trash'))
    if ((product.flags & ProductFlag.THIRDPARTY) !== 0) flags.push(t('product_meta_flag_thirdparty'))
    if ((product.flags & ProductFlag.PERMANENT) !== 0) flags.push(t('product_meta_flag_permanent'))
    if ((product.flags & ProductFlag.STAFF_PICK) !== 0) flags.push(t('product_meta_flag_staff_pick'))

    const platform = t(`platform_${product.platform}`) ?? product.platform

    const defaultCurrencyCode = t('default_currency')
    const defaultCurrency = defaultCurrencyCode
      ? await Resolver.resolveCurrency(defaultCurrencyCode)
      : null
    const currency = defaultCurrency ?? await Resolver.resolveCurrency(Const.currencyFallback)
    const orgPrice = Localisation.renderPriceTag(l._id, currency, product)

    const until = date ? paparsya(
      t('announcement_free_until_date'),
      { date: date.toLocaleDateString(t('date_format')) }
    ) : null

    const footer = paparsya(
      t('announcement_footer'),
      { website: Const.links.websiteClean }
    )

    out.push({
      langId: l._id,
      langName: t('lang_name'),
      langNameEn: l.lang_name_en,
      langFlagEmoji: t('lang_flag_emoji'),
      platform,
      claimLong: t('announcement_button_text'),
      claimShort: 'GET',
      free: t('announcement_pricetag_free'),
      header: t('announcement_header'),
      footer,
      orgPrice,
      until,
      flags
    })
  }

  return out
}
