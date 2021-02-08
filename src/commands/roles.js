const Discord = require('discord.js')
const discordUtil = require('./../util/discord')
const data = require('../db/data')
const database = require('../db/database')
const log = require('../util/logger')

let bot, testUser

const initRoles = (botArg, testUserArg) => {
	bot = botArg
	testUser = testUserArg
}

// Get the current score role
const getScoreRole = points => {
	const roleThresh = data.getRoleThresholds().find(r => points >= r.threshold)
	if (!roleThresh) {
		return null
	}
	return roleThresh.role
}

// Updates the score from the old role to the new
const updateScoreRoles = async (message, score) => {
	if (testUser) {
		// Ignore this when test user mode active
		return
	}
	const { member } = message
	const newRole = getScoreRole(score.points)
	if (newRole && !member.roles.cache.get(newRole)) {
		// Update roles
		const newRoleName = (await discordUtil.getGuild(bot)).roles.cache.get(
			newRole,
		).name
		log.info(`${message.author.username} earned the role ${newRoleName}`)
		message.reply(`you earned the rank "${newRoleName}"`)
		const roleIds = data.getRoleThresholds().map(r => r.role)
		await member.roles.remove(roleIds, 'Score threshold reached')
		await member.roles.add(newRole, 'Score threshold reached')
	}
}

const setRoleThreshold = async (message, args) => {
	// Permission check
	if (!discordUtil.checkAdmin(message)) {
		return
	}

	// Arg check
	const role = args[0]
		? await discordUtil.getRoleStartsWith(bot, args[0])
		: null
	if (!role) {
		return message.reply('you must include a role!')
	}
	const threshold = args[1] ? parseInt(args[1]) : null
	if (!threshold || isNaN(threshold)) {
		return message.reply('you must include a points threshold!')
	}

	const msg = `role threshold for "${role.name}" updated to ${threshold} points`
	log.info(msg)

	// Update
	data.updateRoleThreshold({
		role: role.id,
		threshold,
	})

	message.reply(msg)
}

const listRoleThresholds = async message => {
	const roleCache = (await discordUtil.getGuild(bot)).roles.cache

	const embed = new Discord.MessageEmbed()
		.setTitle('Score Thresholds')
		.setAuthor(bot.user.username, bot.user.avatarURL())
		.setColor(0xd82929)

	data
		.getRoleThresholds()
		.slice()
		.reverse()
		.forEach(t => {
			const role = roleCache.get(t.role)
			embed.addFields({
				name: `${role.name}`,
				value: `${t.threshold} points`,
			})
		})

	message.channel.send({ embed })
}

// Self assign roles

const selfAssignable = async (message, args) => {
	if (!discordUtil.checkAdmin(message)) {
		return
	}
	const role = args[0]
		? await discordUtil.getRoleStartsWith(bot, args[0])
		: null
	if (!role) {
		return message.reply('cannot find role')
	}

	const selfAssign = {
		role: role.id,
	}

	log.info(
		`${message.author.username} toggled role ${role.name} as self assignable`,
	)
	if (database.isSelfAssign(selfAssign)) {
		// Remove self assign
		database.removeSelfAssign(selfAssign)
		return message.reply(`role "${role.name}" is no longer self assignable`)
	} else {
		// Add self assign
		database.addSelfAssign(selfAssign)
		return message.reply(`role "${role.name}" is now self assignable`)
	}
}

const selfAssign = async (message, args) => {
	if (!args[0]) {
		// Show all self assignable roles
		const roleIds = database.listSelfAssign().map(r => r.role)
		const roles = (await discordUtil.getGuild(bot)).roles.cache
			.filter(r => roleIds.indexOf(r.id) > -1)
			.map(r => r.name)
			.sort()

		const embed = new Discord.MessageEmbed()
			.setTitle('Self Assignable Roles')
			.setAuthor(bot.user.username, bot.user.avatarURL())
			.setColor(0xd82929)
		embed.setDescription('Here are all the roles you can self assign')
		embed.addFields({ name: 'Roles', value: roles.join('\n') })
		return message.channel.send({ embed })
	}
	const role = await discordUtil.getRoleStartsWith(bot, args[0])
	if (!role) {
		return message.reply('cannot find role')
	}
	if (!database.isSelfAssign({ role: role.id })) {
		return message.reply(`role "${role.name}" is not self assignable`)
	}

	const { member } = message
	log.info(`${message.author.username} toggled role ${role.name}`)
	if (member.roles.cache.find(r => r.id === role.id)) {
		// Remove role
		await member.roles.remove(role, 'Self assigned')
		message.reply(`role "${role.name}" removed`)
	} else {
		// Add role
		await member.roles.add(role, 'Self assigned')
		message.reply(`role "${role.name}" added`)
	}
}

module.exports = {
	initRoles,
	getScoreRole,
	updateScoreRoles,
	setRoleThreshold,
	listRoleThresholds,
	selfAssign,
	selfAssignable,
}
