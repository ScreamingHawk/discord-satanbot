const Discord = require('discord.js')
const discordUtil = require('./../util/discord')

let bot, prefix, HELP_DETAILS

const initHelp = (botArg, prefixArg) => {
	bot = botArg
	prefix = prefixArg
	HELP_DETAILS = {
		score: {
			admin: false,
			short: 'Display your current points',
			detailed: `\`${prefix}score\`\nDisplay your current points`,
		},
		give: {
			admin: true,
			short: 'Modify someone\'s points',
			detailed: `\`${prefix}give @user 10\`\nAdmin command to modify points.\nCan give negative points to subtract`,
		},
		leaderboard: {
			admin: false,
			short: 'Show the top 10 points leaders',
			detailed: `\`${prefix}leaderboard\`\nShow the top 10 points leaders`,
		},
		threshold: {
			admin: true,
			short: 'Set up the autoroles gained through points',
			detailed: `\`${prefix}threshold role_name 10\`\nSet the role provided to be awards at 10 points\nThis command is only available to admins`,
		},
	}
}

const showHelp = async (message, args) => {
	// Embedded help
	const embed = new Discord.MessageEmbed()
		.setTitle('Help')
		.setAuthor(bot.user.username, bot.user.avatarURL())
		.setColor(0xd82929)

	const helpCommand = args[0]
	const isAdmin = discordUtil.checkAdmin(message)

	if (helpCommand && helpCommand in HELP_DETAILS) {
		// Show the help info for a single command
		const helpDetail = HELP_DETAILS[helpCommand]
		if (helpDetail.admin && !isAdmin) {
			return message.reply(
				`the ${helpCommand} command is only available for admins`,
			)
		}
		embed.setDescription(`Here's some more info about ${helpCommand}`)
		embed.addFields({ name: helpCommand, value: helpDetail.details })
	} else {
		// Complete help
		embed.setDescription(
			`Here's all the things I can do!\nType \`${prefix}help command\` for more info about a command`,
		)
		for (const [command, value] of Object.entries(HELP_DETAILS)) {
			if (!(value.admin && !isAdmin)) {
				embed.addFields({ name: `${prefix}${command}`, value: value.short })
			}
		}
	}

	return message.channel.send({ embed })
}

module.exports = {
	initHelp,
	showHelp,
}
