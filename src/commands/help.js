const Discord = require('discord.js')
const discordUtil = require('./../util/discord')
const scores = require('./scores')

let bot, prefix, HELP_DETAILS

const initHelp = (botArg, prefixArg) => {
	bot = botArg
	prefix = prefixArg
	HELP_DETAILS = {
		// Scores
		score: {
			admin: false,
			short: 'Display your current points',
			detailed: [
				`\`${prefix}score\``,
				'Display your current points.',
				`You gain 2-5 points each time you post, with a ${scores.POINTS_TIMEOUT_MINUTES} minute cooldown.`,
				`Bonus points are earned (1 for every ${scores.DEAD_SERVER_MINS_PER_POINT} mins) if you post after the server has had ${scores.DEAD_SERVER_MINUTES} minutes of inactivity.`,
				'Earning points will grant you higher roles and more powers.',
				'When you earn enough points you can `prestige` and gain a vanity role.',
			].join('\n'),
		},
		give: {
			admin: true,
			short: 'Modify someone\'s points',
			detailed: `\`${prefix}give @user 10\`\nAdmin command to modify points.\nCan give negative points to subtract`,
		},
		ignore: {
			admin: true,
			short: 'Toggle ignoring this channel for points',
			detailed: `\`${prefix}ignore\`\nPrevents this channel from scoring points.\nRun the command again to reenable scoring in this channel`,
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
		thresholds: {
			admin: false,
			short: 'List the autoroles gained through points',
			detailed: `\`${prefix}thresholds\`\nLists the role provided at each point threshold\nThis command is only available to admins`,
		},
		// Roles
		assign: {
			admin: false,
			short: 'Self assign roles',
			detailed: `\`${prefix}assign role_name\`\nAdds a role to the user if the role is self assignable\nRun this command again to remove the role\nRun \`${prefix}assign\` to list all the available roles`,
		},
		assignable: {
			admin: true,
			short: 'Enable self assigning for roles',
			detailed: `\`${prefix}assignable role_name\`\nSets the role to be self assignable using the \`${prefix}assign\` command\nRun this command again to remove self assignability`,
		},
		// Audit
		audit: {
			admin: true,
			short: 'Enable audit logging in this channel',
			details: `\`${prefix}audit\`\nEnables audit logging in this channel\nUse this to monitor deleted messages`,
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
	const isAdmin = discordUtil.checkAdmin(message, false)

	if (helpCommand && helpCommand in HELP_DETAILS) {
		// Show the help info for a single command
		const helpDetail = HELP_DETAILS[helpCommand]
		if (helpDetail.admin && !isAdmin) {
			return message.reply(
				`the ${helpCommand} command is only available for admins`,
			)
		}
		embed.setDescription(`Here's some more info about ${helpCommand}`)
		embed.addFields({ name: helpCommand, value: helpDetail.detailed })
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
