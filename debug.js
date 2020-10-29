/* eslint-disable no-unused-vars */
require('dotenv').config()
const log = require('./src/util/logger')
const Discord = require('discord.js')
const database = require('./src/db/database')
const scores = require('./src/commands/scores')

database.initDatabase()

const TOKEN = process.env.DISCORD_TOKEN
const bot = new Discord.Client()
bot.on('ready', () => {
	log.info('Discord login successful!')
})
bot.login(TOKEN)
