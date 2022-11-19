import { CMS, Localisation, ProductFlag, SanitizedProductType } from "@freestuffbot/common"
import { Task, TaskId } from "@freestuffbot/rabbit-hole"

function renderPrice(product: SanitizedProductType, locale: string) {
  const [ error, currencies ] = CMS.currencies;
  if (error) throw error;

  const euro = currencies[0];
  const dollar = currencies[1];

  const euroString = Localisation.renderPriceTag(locale, euro, product);
  const dollarString = Localisation.renderPriceTag(locale, dollar, product);

  return `<s>${euroString}/${dollarString}</s>`
}

function formatAnnouncement(product: SanitizedProductType, locale = 'en-US') {
  const header = Localisation.text(locale, '=announcement_header');
  const price = renderPrice(product, locale);
  const free = Localisation.text(locale, '=announcement_pricetag_free');
  const until = Localisation.text(locale, '=announcement_free_until_date', {
    date: new Date(product.until).toLocaleDateString(locale),
  });
  const platform = Localisation.text(locale, `=platform_${product.platform}`);

  const flags = [];
  if ((product.flags & ProductFlag.TRASH) !== 0) flags.push(Localisation.text(locale, '=game_meta_flag_trash'));
  if ((product.flags & ProductFlag.THIRDPARTY) !== 0) flags.push(Localisation.text(locale, '=game_meta_flag_thirdparty'));

  const footer = Localisation.text(locale, '=announcement_footer', {
    website: '<a href="https://freestuffbot.xyz/">freestuffbot.xyz</a>'
  });

  // const claim_short = 'GET';

  const caption = [
    `<b>${header}</b>`,
    `<b>${product.title}</b>`,
    `${price} <b>${free}</b> ${until} • ${[platform, ...flags].join(' • ')}`,
    `<i>${footer}</i>`,
  ];

  return caption.join('\n');
}

async function sendAnnouncement() {
  Localisation.text('en-US', '=announcement_theme9', {

  });
}

export default async function handleAppsTest(task: Task<TaskId.TELEGRAM_TEST>): Promise<boolean> {
  // TODO handle task, return if successful

  return true
}
