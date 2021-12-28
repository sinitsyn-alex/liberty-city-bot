import TelegramBot, { Message } from 'node-telegram-bot-api';
import { Command, fileOptions, sendPhotoOptions, Step, Text } from './app.const';
import { TStep } from './app.types';
import { promises as fsPromises } from 'fs';
import QRCode from 'qrcode';
import { compressAsync, getUrl, prepareTemplate } from './app.utils';
import { createShortenUrl } from './app.transport';
require('dotenv').config();

const telegramBot = new TelegramBot(process.env.TOKEN!, { polling: true });
const stepQueue = new Map<number, TStep>();

telegramBot.onText(Command.START, ({ chat: { id: chatId } }: Message) => {
    const currentStep = Step.PERSONAL_NAME;

    stepQueue.set(chatId, { currentStep, data: [] });
    void telegramBot.sendMessage(chatId, Text[currentStep]);
});

telegramBot.on('message', ({ chat: { id: chatId }, text = '' }: Message) => {
    if (Command.START.test(text)) return;

    const step = stepQueue.get(chatId);

    if (!step) return telegramBot.sendMessage(chatId, Text[Step.START]);

    const nextStep: Step = step.currentStep + 1;

    if (nextStep in Step) {
        stepQueue.set(chatId, { currentStep: nextStep, data: [...step.data, text] });

        return telegramBot.sendMessage(chatId, Text[nextStep]);
    }

    void fsPromises
        .readFile('./src/index.html', 'utf8')
        .then((html: string) => prepareTemplate(step, text, html))
        .then((minifiedHtml: string) => compressAsync(minifiedHtml))
        .then((compressedHtml: Array<number>) => createShortenUrl(getUrl(compressedHtml)))
        .then((shortenUrl: string) => QRCode.toBuffer(shortenUrl, { scale: 10 }))
        .then((buffer: Buffer) => sendPhoto(chatId, buffer));
});

function sendPhoto(chatId: number, buffer: Buffer) {
    stepQueue.delete(chatId);
    // @ts-ignore
    void telegramBot.sendPhoto(chatId, buffer, sendPhotoOptions, fileOptions);
}
