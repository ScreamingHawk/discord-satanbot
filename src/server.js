require('dotenv').config()
const log = require('./util/logger')
const Discord = require('discord.js')

// Get token
const TOKEN = process.env.DISCORD_TOKEN
if (!TOKEN) {
	for (let i = 0; i < 5; i++) {
		log.error('NO DISCORD TOKEN!!!')
	}
	process.exit(1)
}

// Spin up bot
const bot = new Discord.Client()
bot.on('ready', () => {
	log.info('Discord login successful!')
	process.exit(0)
})
bot.login(TOKEN)
