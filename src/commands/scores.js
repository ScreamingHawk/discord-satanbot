const random = require('random')
const moment = require('moment')
const Discord = require('discord.js')
const log = require('../util/logger')
const { getScore, listScores, setScore } = require('../db/database')
const { getMember } = require('../util/discord')

// Adapted from https://anidiots.guide/coding-guides/sqlite-based-points-system

const POINTS_TIMEOUT_SECONDS = 2 * 60
const timeouts = {}

let deadServerBonus = false
const DEAD_SERVER_MINUTES = 15
let lastMessageTimestamp = moment()

const ROLE_THRESHOLDS = [
	{
		roleStart: '1st Circle',
		threshold: 1,
	},
	{
		roleStart: '2nd Circle',
		threshold: 10,
	},
	{
		roleStart: '3rd Circle',
		threshold: 100,
	},
	{
		roleStart: '4th Circle',
		threshold: 1000,
	},
	{
		roleStart: '5th Circle',
		threshold: 10000,
	},
	{
		roleStart: '6th Circle',
		threshold: 100000,
	},
].sort((a, b) => (a.threshold > b.threshold ? -1 : 1)) // Reverse order

let bot

const initScores = (botArg, deadServerBonusArg) => {
	bot = botArg
	deadServerBonus = deadServerBonusArg || false
}

const getScoreRole = score => {
	const role = ROLE_THRESHOLDS.find(r => score >= r.threshold)
	if (!role) {
		return null
	}
	return role.roleStart
}

// Calculate bonus points earned
const getBonusPoints = (message, last = lastMessageTimestamp) => {
	if (deadServerBonus) {
		const now = moment()
		const deadServerMins = now.diff(last, 'minutes') - DEAD_SERVER_MINUTES
		lastMessageTimestamp = now
		if (deadServerMins > 0) {
			message.reply(
				`you earned an extra ${deadServerMins} points for reviving the server!`,
			)
			return deadServerMins
		}
	}
	return 0
}

const incrementPoints = message => {
	const { author } = message

	// Check user timeout expired
	const timeout = timeouts[author.id]
	const ts = moment(message.createdAt)
	if (!timeout || ts.diff(timeout.last, 'seconds') > POINTS_TIMEOUT_SECONDS) {
		// Award points
		const score = getScore(author.id)
		score.points += random.int(1, 3) + getBonusPoints(message)
		setScore(score)
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
		const score = getScore(user.id)
		return message.channel.send(
			`${user.tag} currently has ${score.points} points!`,
		)
	}
	// Show author's points
	const score = getScore(message.author.id)
	return message.reply(`you currently have ${score.points} points!`)
}

const addPoints = (message, args) => {
	// Permission check
	if (!message.member.hasPermission('ADMINISTRATOR')) {
		return message.reply('only administators can do this')
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
	const score = getScore(user.id)
	score.points += pointsToAdd
	setScore(score)

	return message.channel.send(
		`${user.tag} has received ${pointsToAdd} points and now stands at ${score.points} points.`,
	)
}

const showLeaderboard = async message => {
	const top10 = listScores(10)

	// Now shake it and show it! (as a nice embed, too!)
	const embed = new Discord.MessageEmbed()
		.setTitle('Leaderboard')
		.setAuthor(bot.user.username, bot.user.avatarURL())
		.setDescription('Our top 10 points leaders!')
		.setColor(0xd82929)

	for (const data of top10) {
		let member = await getMember(bot, data.user)
		if (member && member.user) {
			embed.addFields({ name: member.user.tag, value: `${data.points} points` })
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
	getScoreRole,
	getBonusPoints,
}
