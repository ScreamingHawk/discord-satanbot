const discord = require('../util/discord')
const data = require('../db/data')
const log = require('../util/logger')

let bot

const initRoles = botArg => {
	bot = botArg
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
	const { member } = message
	const newRole = getScoreRole(score.points)
	if (newRole && !member.roles.cache.get(newRole)) {
		// Update roles
		const newRoleName = (await discord.getGuild(bot)).roles.cache.get(newRole)
			.name
		log.info(`${message.author.username} earned the role ${newRoleName}`)
		message.reply(`you earned the rank "${newRoleName}"`)
		const roleIds = data.getRoleThresholds().map(r => r.role)
		await member.roles.remove(roleIds, 'Score threshold reached')
		await member.roles.add(newRole, 'Score threshold reached')
	}
}

const setRoleThreshold = async (message, args) => {
	// Permission check
	if (!discord.checkAdmin(message)) {
		return
	}

	// Arg check
	const role = args[0] ? await discord.getRoleStartsWith(bot, args[0]) : null
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

module.exports = {
	initRoles,
	getScoreRole,
	updateScoreRoles,
	setRoleThreshold,
}
