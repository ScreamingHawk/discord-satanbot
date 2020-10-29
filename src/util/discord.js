const log = require('./logger')

const getMember = async (bot, userId) => {
	const guild = bot.guilds.cache.first()
	let user = guild.members.cache.get(userId)
	if (!user) {
		log.debug(`Getting member ${userId}`)
		user = await guild.members.fetch(userId)
	}
	return user
}

module.exports = {
	getMember,
}
