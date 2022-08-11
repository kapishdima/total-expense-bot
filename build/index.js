import dotenv from 'dotenv';
import { groupedExpenses, scheduleExpenses, totalExpenses } from './expenses/commands.js';
import { registerCommands, startBot } from './telegram/client.js';
dotenv.config();
const telegramCommands = {
    start: scheduleExpenses,
    total: totalExpenses,
    details: groupedExpenses,
};
const main = () => {
    registerCommands(telegramCommands);
    startBot();
};
main();
