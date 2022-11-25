import { Telegraf } from 'telegraf';

import { config } from '../';

if (typeof config.telegram.botToken !== 'string')
    throw new Error('The telegram bot token is not set!');
if (!/^\d+:[0-9a-zA-Z]+-[0-9a-zA-Z]+$/.test(config.telegram.botToken))
    throw new Error(`Invalid telegram bot token: ${config.telegram.botToken}`);

export const bot = new Telegraf(config.telegram.botToken);
