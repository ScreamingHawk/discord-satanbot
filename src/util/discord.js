const log = require('./logger')

const getGuild = async bot => await bot.guilds.cache.first()

const getMember = async (bot, userId) => {
	const guild = getGuild(bot)
	let user = guild.members.cache.get(userId)
	if (!user) {
		log.debug(`Getting member ${userId}`)
		user = await guild.members.fetch(userId)
	}
	return user
}

module.exports = {
	getGuild,
	getMember,
}
