const discord = require('../util/discord')
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
		return
	} // Ignore this when test user mode active
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

// Self assign roles

const selfAssignable = async (message, args) => {
	if (!discord.checkAdmin(message)) {
		return
	}
	const role = args[0] ? await discord.getRoleStartsWith(bot, args[0]) : null
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
		const roles = (await discord.getGuild(bot)).roles.cache
			.filter(r => roleIds.indexOf(r.id) > -1)
			.map(r => r.name)
		return message.reply(`self assignable roles:\n${roles.join('\n')}`)
	}
	const role = await discord.getRoleStartsWith(bot, args[0])
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
	selfAssign,
	selfAssignable,
}
