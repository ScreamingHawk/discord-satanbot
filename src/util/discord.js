const log = require('./logger')

let guild

const getGuild = async bot => {
	if (!guild) {
		guild = await bot.guilds.cache.first()
	}
	return guild
}

const getMember = async (bot, userId) => {
	const g = await getGuild(bot)
	let user = g.members.cache.get(userId)
	if (!user) {
		log.debug(`Getting member ${userId}`)
		user = await g.members.fetch(userId)
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
		r.name.toLowerCase().startsWith(roleNameStart.toLowerCase()),
	) || null

module.exports = {
	getGuild,
	getMember,
	checkAdmin,
	getRoleStartsWith,
}
