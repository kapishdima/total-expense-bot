import dotenv from 'dotenv';

import { groupedExpenses, scheduleExpenses, totalExpenses } from './expenses/commands.js';
import { registerCommands, startBot, TelegramCommand } from './telegram/client.js';

dotenv.config();

const telegramCommands: TelegramCommand = {
  start: scheduleExpenses,
  total: totalExpenses,
  details: groupedExpenses,
};

const main = () => {
  registerCommands(telegramCommands);
  startBot();
};

main();
