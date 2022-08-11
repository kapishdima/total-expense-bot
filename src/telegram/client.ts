import { Context, Telegraf } from 'telegraf';

export type TelegramCommand = {
  [key: string]: (ctx?: Context) => void;
};

const bot = new Telegraf(process.env.TELEGRAM_BOT_KEY);

export const registerCommands = (commands: TelegramCommand) => {
  for (const [action, handler] of Object.entries(commands)) {
    bot.command(action, handler);
  }
};

export const startBot = () => {
  bot.launch();
};
