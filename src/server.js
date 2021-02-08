require('dotenv').config()
const log = require('./util/logger')
const Discord = require('discord.js')
const { initDatabase } = require('./db/database')
const scores = require('./commands/scores')
const roles = require('./commands/roles')
const audit = require('./commands/audit')
const help = require('./commands/help')

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

// Prepare env vars
const PREFIX = process.env.PREFIX || '#'
log.info(`Prefix is ${PREFIX}`)
const DEAD_SERVER_BONUS = process.env.DEAD_SERVER_BONUS || false
log.info(`Dead server bonus is ${DEAD_SERVER_BONUS ? 'enabled' : 'disabled'}`)
const TEST_USER = process.env.TEST_USER || null
if (TEST_USER) {
	log.warn(`Running with access only for ${TEST_USER}`)
}

// Spin up bot
const bot = new Discord.Client()
bot.on('ready', () => {
	log.info('Discord login successful!')
	// Initialise commands
	scores.initScores(bot, DEAD_SERVER_BONUS)
	roles.initRoles(bot, TEST_USER)
	audit.initAudit(bot, TEST_USER)
	help.initHelp(bot, PREFIX)
	log.info('Commands initialised')
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
	scores.incrementPoints(message)

	// Check for bot command
	if (message.content.indexOf(PREFIX) !== 0) {
		return
	}

	// Get args for handling bot command
	const args = message.content.slice(PREFIX.length).trim().split(/ +/g)
	const command = args.shift().toLowerCase()

	// Ignore if running in test user mode and isn't test user
	if (TEST_USER && message.author.username !== TEST_USER) {
		return
	}

	if (command === 'help') {
		return help.showHelp(message, args)
	}
	if (command === 'ping') {
		log.info('ping')
		return message.reply('pong')
	}
	// Scores
	if (command === 'threshold') {
		return roles.setRoleThreshold(message, args)
	}
	if (command === 'score') {
		return scores.displayPoints(message, args)
	}
	if (command === 'ignore') {
		return scores.toggleIgnoreChannel(message)
	}
	if (command === 'leaderboard') {
		return scores.showLeaderboard(message)
	}
	if (command === 'give') {
		return scores.addPoints(message, args)
	}
	// Roles
	if (command === 'assign') {
		return roles.selfAssign(message, args)
	}
	if (command === 'assignable') {
		return roles.selfAssignable(message, args)
	}
	// Audit
	if (command === 'audit') {
		return audit.setAuditLoggingChannel(message)
	}
})

bot.login(TOKEN)
