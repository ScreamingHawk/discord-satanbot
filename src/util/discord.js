const log = require('./logger')

let guild

const getGuild = async bot => {
	if (!guild) {
		guild = await bot.guilds.cache.first()
	}
	return guild
}

const getChannel = async (bot, channelId) => {
	const g = await getGuild(bot)
	let chan = g.channels.cache.get(channelId)
	if (!chan) {
		log.debug(`Getting channel ${channelId}`)
		chan = await g.channels
			.fetch(channelId)
			.catch(e => log.error(`Error getting channel: ${e}`))
	}
	return chan
}

const getMember = async (bot, userId) => {
	const g = await getGuild(bot)
	let user = g.members.cache.get(userId)
	if (!user) {
		log.debug(`Getting member ${userId}`)
		user = await g.members
			.fetch(userId)
			.catch(e => log.error(`Error getting member: ${e}`))
	}
	return user
}

const checkAdmin = (message, alert = true) => {
	if (!message.member.hasPermission('ADMINISTRATOR')) {
		if (alert) {
			message.reply('only administators can do this')
		}
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
	getChannel,
	getMember,
	checkAdmin,
	getRoleStartsWith,
}
