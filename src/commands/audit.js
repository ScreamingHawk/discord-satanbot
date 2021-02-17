const Discord = require('discord.js')
const log = require('../util/logger')
const database = require('../db/database')
const discordUtil = require('../util/discord')

const AUDIT_CHANNEL_KEY = 'auditLoggingChannel'
let bot, testUser
let auditLoggingChannel

// Logging deleted messages https://stackoverflow.com/a/62936212/2027146

const initAudit = (botArg, testUserArg) => {
	bot = botArg
	testUser = testUserArg
	// Initialise the auditLoggingChannel from the database
	auditLoggingChannel = database.getConfig(AUDIT_CHANNEL_KEY)
	if (auditLoggingChannel && auditLoggingChannel.value) {
		auditLoggingChannel = auditLoggingChannel.value
	}
	bot.on('messageDelete', onDeletedMessage)
}

const onDeletedMessage = async message => {
	// Ignore bots
	if (message.author.bot) {
		return
	}
	// Ignore if running in test user mode and isn't test user
	if (testUser && message.author.username !== testUser) {
		return
	}
	if (!auditLoggingChannel) {
		log.debug('Audit logging disabled')
		return
	}
	log.debug('Message delete detected')

	const DeleteEmbed = new Discord.MessageEmbed()
		.setTitle('DELETED MESSAGE')
		.setColor('#fc3c3c')
		.addField('Author', message.author.tag, true)
		.addField('Channel', message.channel, true)
		.addField('Message', message.content || '')
		.setFooter(`Message ID: ${message.id} | Author ID: ${message.author.id}`)

	const channel = await discordUtil.getChannel(bot, auditLoggingChannel)
	if (channel) {
		channel.send(DeleteEmbed)
	}
}

const setAuditLoggingChannel = message => {
	if (!discordUtil.checkAdmin(message)) {
		return
	}
	const { channel } = message
	const config = {
		key: AUDIT_CHANNEL_KEY,
		value: channel.id,
	}
	database.setConfig(config)
	auditLoggingChannel = channel.id
	channel.send('Set this channel for audit logging')
}

module.exports = {
	initAudit,
	setAuditLoggingChannel,
}
