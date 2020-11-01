const discord = require('../util/discord')
const data = require('../db/data')

let bot

const initRoles = botArg => {
	bot = botArg
}

// Get the current score role
const getScoreRole = points => {
	const role = data.getRoleThresholds().find(r => points >= r.threshold)
	if (!role) {
		return null
	}
	return role.role
}

// Updates the score from the old role to the new
const updateScoreRoles = async (oldPoints, score) => {
	const oldRole = getScoreRole(oldPoints)
	const newRole = getScoreRole(score.points)
	if (oldRole !== newRole) {
		const member = await discord.getMember(bot, score.user)
		// TODO Alert user
		member.roles.add(oldRole, 'Score threshold reached')
		member.roles.remove(newRole, 'Score threshold reached')
	}
}

const setRoleThreshold = (message, args) => {
	// Permission check
	if (!discord.checkAdmin(message)) {
		return
	}

	// Arg check
	const role = args[0] ? discord.getRoleStartsWith(args[0]) : null
	if (!role) {
		return message.reply('you must include a role!')
	}
	const threshold = args[1] ? parseInt(args[1]) : null
	if (!threshold || isNaN(threshold)) {
		return message.reply('you must include a points threshold!')
	}

	// Update
	data.updateRoleThreshold({
		role: role.id,
		threshold,
	})

	message.reply('role threshold updated')
}

module.exports = {
	initRoles,
	getScoreRole,
	updateScoreRoles,
	setRoleThreshold,
}
