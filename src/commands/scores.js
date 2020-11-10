const random = require('random')
const moment = require('moment')
const Discord = require('discord.js')
const log = require('../util/logger')
const database = require('../db/database')
const roles = require('./roles')
const discordUtil = require('../util/discord')

// Adapted from https://anidiots.guide/coding-guides/sqlite-based-points-system

const POINTS_TIMEOUT_SECONDS = 2 * 60
const timeouts = {}

let deadServerBonus = false
const DEAD_SERVER_MINUTES = 45
const DEAD_SERVER_PMINS_PER_POINT = 2
let lastMessageTimestamp = moment()

let ignoreChannels = []

let bot

const initScores = (botArg, deadServerBonusArg) => {
	bot = botArg
	deadServerBonus = deadServerBonusArg || false
	ignoreChannels = database.listScoreIgnore()
}

// Check if channel should be ignored
const checkIgnoreChannel = channel =>
	!!ignoreChannels.find(c => c.channel === channel)

const toggleIgnoreChannel = message => {
	if (!discordUtil.checkAdmin(message)) {
		return
	}
	if (checkIgnoreChannel(message.channel.id)) {
		database.removeScoreIgnore({ channel: message.channel.id })
		message.reply('this channel is no longer ignored from scoring')
	} else {
		database.addScoreIgnore({ channel: message.channel.id })
		message.reply('this channel is now ignored from scoring')
	}
	ignoreChannels = database.listScoreIgnore()
}

// Calculate bonus points earned
const getBonusPoints = (message, last = lastMessageTimestamp) => {
	if (deadServerBonus) {
		const now = moment()
		const deadServerMins = now.diff(last, 'minutes') - DEAD_SERVER_MINUTES
		lastMessageTimestamp = now
		if (deadServerMins > 0) {
			const extraPoints =
				Math.floor(deadServerMins / DEAD_SERVER_PMINS_PER_POINT) + 1
			message.reply(
				`you earned an extra ${extraPoints} points for reviving the server!`,
			)
			return extraPoints
		}
	}
	return 0
}

const incrementPoints = message => {
	if (checkIgnoreChannel(message.channel.id)) {
		return
	}

	const { author } = message

	// Check user timeout expired
	const timeout = timeouts[author.id]
	const ts = moment(message.createdAt)
	if (!timeout || ts.diff(timeout.last, 'seconds') > POINTS_TIMEOUT_SECONDS) {
		// Award points
		const score = database.getScore(author.id)
		score.points += random.int(1, 3) + getBonusPoints(message)
		database.setScore(score)
		roles.updateScoreRoles(message, score)
		log.debug(`User ${author.username} has ${score.points} points`)

		// Update expiry
		timeouts[author.id] = {
			last: ts,
		}
	}
}

const displayPoints = (message, args) => {
	const user = message.mentions.users.first() || bot.users.cache.get(args[0])
	if (user) {
		// Show requested user's points
		const score = database.getScore(user.id)
		return message.channel.send(
			`${user.tag} currently has ${score.points} points!`,
		)
	}
	// Show author's points
	const score = database.getScore(message.author.id)
	return message.reply(`you currently have ${score.points} points!`)
}

const addPoints = (message, args) => {
	// Permission check
	if (!discordUtil.checkAdmin(message)) {
		return
	}

	// Arg check
	const user = message.mentions.users.first() || bot.users.cache.get(args[0])
	if (!user) {
		return message.reply('you must mention someone or give their ID!')
	}
	const pointsToAdd = parseInt(args[1], 10)
	if (!pointsToAdd) {
		return message.reply('you didn\'t tell me how many points to give...')
	}

	// Update points
	const score = database.getScore(user.id)
	score.points += pointsToAdd
	database.setScore(score)
	roles.updateScoreRoles(message, score)

	const msg = `${user.tag} has received ${pointsToAdd} points and now stands at ${score.points} points.`
	log.debug(msg)
	return message.channel.send(msg)
}

const showLeaderboard = async message => {
	const top10 = database.listScores(10)

	// Now shake it and show it! (as a nice embed, too!)
	const embed = new Discord.MessageEmbed()
		.setTitle('Leaderboard')
		.setAuthor(bot.user.username, bot.user.avatarURL())
		.setDescription('Our top 10 points leaders!')
		.setColor(0xd82929)

	for (const [index, data] of top10.entries()) {
		let member = await discordUtil.getMember(bot, data.user)
		if (member && member.user) {
			embed.addFields({
				name: `${index + 1}: ${member.user.tag}`,
				value: `${data.points} points`,
			})
		}
	}
	return message.channel.send({ embed })
}

module.exports = {
	initScores,
	incrementPoints,
	addPoints,
	displayPoints,
	showLeaderboard,
	getBonusPoints,
	toggleIgnoreChannel,
	DEAD_SERVER_MINUTES,
	DEAD_SERVER_PMINS_PER_POINT,
}
