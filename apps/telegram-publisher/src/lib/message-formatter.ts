import { CMS, Localisation, ProductFlag, SanitizedProductType } from "@freestuffbot/common";
import { bot } from 'lib/telegram-bot';

function renderProductPrice(product: SanitizedProductType, locale: string) {
    const [ error, currencies ] = CMS.currencies;
    if (error) throw error;

    const euro = currencies[ 0 ];
    const dollar = currencies[ 1 ];

    const euroString = Localisation.renderPriceTag(locale, euro, product);
    const dollarString = Localisation.renderPriceTag(locale, dollar, product);

    return `<s>${euroString}/${dollarString}</s>`;
}

function renderProductCaption(product: SanitizedProductType, locale: string) {
    const header = Localisation.text(locale, '=announcement_header');
    const price = renderProductPrice(product, locale);
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

    const caption = [
        `<b>${header}</b>`,
        `<b>${product.title}</b>`,
        `${price} <b>${free}</b> ${until} • ${[ platform, ...flags ].join(' • ')}`,
        `<i>${footer}</i>`,
    ];

    return caption.join('\n');
}

export async function sendProduct(chatId: string | number, product: SanitizedProductType, locale = 'en-US') {
    const caption = renderProductCaption(product, locale);

    return await bot.telegram.sendPhoto(chatId, product.thumbnails.org, {
        caption,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [[ { text: 'GET', url: product.urls.org } ]]
        }
    });
}