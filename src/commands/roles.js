const { getMember } = require('../util/discord')
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
		const member = await getMember(bot, score.user)
		// TODO Alert user
		member.roles.add(oldRole, 'Score threshold reached')
		member.roles.remove(newRole, 'Score threshold reached')
	}
}

module.exports = {
	initRoles,
	getScoreRole,
	updateScoreRoles,
}
