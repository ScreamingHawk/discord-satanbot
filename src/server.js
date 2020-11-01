require('dotenv').config()
const log = require('./util/logger')
const Discord = require('discord.js')
const { initDatabase } = require('./db/database')
const {
	initScores,
	incrementPoints,
	addPoints,
	displayPoints,
	showLeaderboard,
} = require('./commands/scores')
const roles = require('./commands/roles')
const { initHelp, showHelp } = require('./commands/help')

// Get token
const TOKEN = process.env.DISCORD_TOKEN
if (!TOKEN) {
	for (let i = 0; i < 5; i++) {
		log.error('NO DISCORD TOKEN!!!')
	}
	process.exit(1)
}

// Intialise database
initDatabase()

const PREFIX = process.env.PREFIX || '#'
log.info(`Prefix is ${PREFIX}`)

// Spin up bot
const bot = new Discord.Client()
bot.on('ready', () => {
	log.info('Discord login successful!')
	// Initialise commands
	initScores(bot, process.env.DEAD_SERVER_BONUS || false)
	initHelp(bot, PREFIX)
})

bot.on('message', message => {
	// Ignore bots
	if (message.author.bot) {
		return
	}
	// Ignore DMs
	if (!message.guild) {
		return
	}

	// Increment user points
	incrementPoints(message)

	// Check for bot command
	if (message.content.indexOf(PREFIX) !== 0) {
		return
	}

	// Get args for handling bot command
	const args = message.content.slice(PREFIX.length).trim().split(/ +/g)
	const command = args.shift().toLowerCase()

	if (command === 'help') {
		return showHelp(message, args)
	}
	if (command === 'threshold') {
		return roles.setRoleThreshold(message, args)
	}
	if (command === 'score') {
		return displayPoints(message, args)
	}
	if (command === 'leaderboard') {
		return showLeaderboard(message)
	}
	if (command === 'give') {
		return addPoints(message, args)
	}
})

bot.login(TOKEN)
