const TelegramBot = require("node-telegram-bot-api")
const config = require("./config")
const bot = new TelegramBot(config.BOT_TOKEN,{polling: true})
const mongoose = require('mongoose')
const Couple = require('./schema')
const commands = ['/start','🔍 Найти собеседника','📊 Сейчас онлайн','❌ Остоновить поиск','❌ Выйти из приватного чата','🔍 Найти нового собеседника']
const start_keyboard = {
        keyboard: [["🔍 Найти собеседника"],["📊 Сейчас онлайн"]],
        resize_keyboard: true
}
const search_keyboard = {
    keyboard: [["❌ Остоновить поиск"]],
    resize_keyboard: true
}
const talk_keyboard = {
    keyboard: [["❌ Выйти из приватного чата"],["🔍 Найти нового собеседника"]],
    resize_keyboard: true
}

bot.onText(/\/start/,(msg)=>{
    try {
        bot.deleteMessage(msg.chat.id,msg.message_id)
        find_and_delete(msg.chat.id)
        bot.sendMessage(msg.chat.id,"Выберите команду",{reply_markup: start_keyboard})
    } catch (error) {
        console.log(error)
    }
})


bot.onText(/🔍 Найти собеседника|🔍 Найти нового собеседника/,async (msg)=>{
    try {
        bot.deleteMessage(msg.chat.id,msg.message_id)
        find_and_delete(msg.chat.id)
        let condidate = await Couple.findOne({partner_id: null})
        let new_user = new Couple({chat_id: msg.chat.id})
        
        bot.sendMessage(msg.chat.id,"Ищем собеседника...",{reply_markup: search_keyboard})
        if(condidate && (await isChatExists(condidate.chat_id) && new_user.chat_id != condidate.chat_id)){
            new_user.partner_id = condidate.chat_id
            condidate.partner_id = new_user.chat_id
            await condidate.save()
            bot.sendMessage(new_user.chat_id,"Партнер найден!",{reply_markup: talk_keyboard})
            bot.sendMessage(condidate.chat_id,"Партнер найден!",{reply_markup: talk_keyboard})
        }
        await new_user.save()
    } catch (error) {
        console.log(error)
    }
})

bot.onText(/❌ Выйти из приватного чата|❌ Остоновить поиск/,async (msg)=>{
    try {
        bot.deleteMessage(msg.chat.id,msg.message_id)
        await find_and_delete(msg.chat.id)
        bot.sendMessage(msg.chat.id,"Выберите команду",{reply_markup: start_keyboard})
    } catch (error) {
        console.log(error)
    }
})

bot.onText(/📊 Сейчас онлайн/,async (msg)=>{
    try {
        bot.deleteMessage(msg.chat.id,msg.message_id)
        let all = await Couple.find({})
        bot.sendMessage(msg.chat.id, "Пользователей: " + all.length)
    } catch (error) {
        console.log(error)
    }
})

bot.onText(/.+/,async (msg)=>{
    try {
        for(let i=0;i<commands.length;i++){
            if(commands[i] == msg.text)
                return
        }
        send_media(msg)
    } catch (error) {
        console.log(error)
    }
})
bot.on('photo',async (msg)=>{
    try {await send_media(msg)} catch (error) {console.log(error)}
})
bot.on('video',async (msg)=>{
    try {await send_media(msg)} catch (error) {console.log(error)}
})
bot.on('voice',async (msg)=>{
    try {await send_media(msg)} catch (error) {console.log(error)}
})
bot.on('audio',async (msg)=>{
    try {await send_media(msg)} catch (error) {console.log(error)}
})
bot.on('sticker',async (msg)=>{
    try {await send_media(msg)} catch (error) {console.log(error)}
})
bot.on('document',async (msg)=>{
    try {await send_media(msg)} catch (error) {console.log(error)}
})
bot.on('animation',async (msg)=>{
    try {await send_media(msg)} catch (error) {console.log(error)}
})
bot.on('video_note',async (msg)=>{
    try {await send_media(msg)} catch (error) {console.log(error)}
})
bot.on('location',async (msg)=>{
    try {await send_media(msg)} catch (error) {console.log(error)}
})
bot.on('contact',async (msg)=>{
    try {await send_media(msg)} catch (error) {console.log(error)}
})

async function isChatExists(id){
    try {
        await bot.sendChatAction(id,"typing")
        return true
    }catch (error) {
        return false
    }
}

async function find_and_delete(id){
    try {
        let user = await Couple.findOne({chat_id: id})
        if(user){
            if(user.partner_id != null){
                let partner = await Couple.findOne({chat_id: user.partner_id, partner_id: user.chat_id})
                if(partner && (await isChatExists(partner.chat_id))){
                    bot.sendMessage(partner.chat_id,"Ваш собеседник вышел из приватного чата",{reply_markup: start_keyboard})
                }
                await Couple.deleteOne({chat_id: partner.chat_id})
            }
            await Couple.deleteOne({chat_id: user.chat_id})
        }
    } catch (error) {
        console.log(error)
    }
}

async function send_media(msg){
    try {
        let user = await Couple.findOne({chat_id: msg.chat.id})

        if(user){
            let partner = await Couple.findOne({chat_id: user.partner_id})
            if(partner){
                if((await isChatExists(partner.chat_id))){
                    if(msg.photo)
                        bot.sendPhoto(partner.chat_id,msg.photo[0].file_id,{caption: msg.caption})
                    else if(msg.voice)
                        bot.sendVoice(partner.chat_id,msg.voice.file_id)
                    else if(msg.audio)
                        bot.sendAudio(partner.chat_id,msg.audio.file_id,{caption: msg.caption})
                    else if(msg.video)
                        bot.sendVideo(partner.chat_id,msg.video.file_id,{caption: msg.caption})
                    else if(msg.sticker)
                        bot.sendSticker(partner.chat_id,msg.sticker.file_id)
                    else if(msg.text)
                        bot.sendMessage(partner.chat_id,msg.text)
                    else if(msg.document)
                        bot.sendDocument(partner.chat_id,msg.document.file_id,{caption: msg.caption})
                    else if(msg.video_note)
                        bot.sendVideoNote(partner.chat_id,msg.video_note.file_id)
                    else if(msg.location)
                        bot.sendLocation(partner.chat_id,msg.location.latitude,msg.location.longitude)
                    else if(msg.contact)
                        bot.sendContact(partner.chat_id,msg.contact.phone_number,msg.contact.first_name)
                }else{
                    find_and_delete(partner.chat_id)
                }
            }
        }
    } catch (error) {
        console.log(error)
    }
}

async function start(){
    try {
        await mongoose.connect(config.MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    } catch (error) {
        console.log(error)
    }
}
start()