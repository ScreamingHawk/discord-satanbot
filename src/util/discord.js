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

const checkAdmin = message => {
	if (!message.member.hasPermission('ADMINISTRATOR')) {
		message.reply('only administators can do this')
		return false
	}
	return true
}

const getRoleStartsWith = async (bot, roleNameStart) =>
	(await getGuild(bot)).roles.cache.find(r =>
		r.name.startsWith(roleNameStart),
	) || null

module.exports = {
	getGuild,
	getMember,
	checkAdmin,
	getRoleStartsWith,
}
