const { Telegraf } = require('telegraf')
const fs = require('fs/promises')
const axios = require("axios")
const cron = require("node-cron")
const path = require("path")
const functions = require("./utils/functions")
const accounts = require("./accounts.json")
const dotenv = require("dotenv").config()

let db = {}
const bot = new Telegraf(process.env.TOKEN)

const delay = async (ms = 10000) => new Promise(resolve => setTimeout(resolve, ms))
/*
* Results, usernames
*
*/
const helpMessage = `
/find <username> - fetch details by their username
/start - start the bot
/help - command reference
`


functions.initDB(accounts, true).then(async (ress) => {
    console.log(ress)
    if(ress === "ok") db = require("./db.json")
    console.log(db)
}).catch(e => {
    console.log("Error occurred during initializing")
})


bot.start(ctx => {
    console.log(ctx)
    ctx.reply("Welcome to our bot")
    ctx.reply(helpMessage)
})

bot.help(ctx => {
    ctx.reply(helpMessage)
})

/*
* Users can fetch data using /find <leetcodeUsername>
*
*/

bot.command("find", async (ctx) => {
    let input = ctx.message.text
    let inputArr = input.split(" ")
    let message = ""
    if(inputArr.length == 1) {
        message = "You did not put any arguments"
    } else {
        inputArr.shift() // deleteing first element
        message = inputArr.join(" ")
    }
    // console.log(message)
    
    try {
        const mreply = await functions.getStats(message, " ")
        ctx.reply(mreply)
    } catch(e) {
        ctx.reply("There is a problem, please try after some time")
    }
    
})

/*
* This feature is only for Groups
*/

async function newProblemMsg(name, username) {
    try { 
    let result = await functions.getTotalSolved(username)
    // console.log(resutlt)
    const chatID = process.env.CHATID
    let str = name.charAt(0).toUpperCase() + name.slice(1)
            if(db[name] == 0) {
                db[name] = result
                try {
                   await functions.initDB(db, false)
                   console.log(db)
                } catch(e) {
                    console.log(e)
                }
                return
            }
            if(result - db[name] > 0) {
                let prob = result - db[name] == 1 ? "problem" : "problems"
                bot.telegram.sendMessage(chatID, `${str} solved ${result - db[name]} new ${prob} `)
                db[name] = result
                try {
                    await functions.initDB(db, false)
                    console.log(db)
                 } catch(e) {
                     console.log(e)
                }
                return
        }

    } catch(e) {
        // error handling

    }
}

async function getAllStats() {
    for(key in accounts) {
        if(accounts.hasOwnProperty(key)) {
            newProblemMsg(key, accounts[key])
            await delay()
        }
    }
}


cron.schedule("*/1 * * * *", getAllStats)

bot.launch()