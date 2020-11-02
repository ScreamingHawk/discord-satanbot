const Discord = require('discord.js')

const HELP_SIMPLE = {
	score: 'Display your current points',
	give: 'Admin command to modify points',
	leaderboard: 'Show the top 10 points leaders',
	threshold: 'Set up the autoroles gained through points',
}

let bot, prefix, HELP_COMPLETE

const initHelp = (botArg, prefixArg) => {
	bot = botArg
	prefix = prefixArg
	HELP_COMPLETE = {
		score: `\`${prefix}score\`\nDisplay your current points`,
		give: `\`${prefix}give @user 10\`\nAdmin command to modify points.\nCan give negative points to subtract`,
		leaderboard: `\`${prefix}leaderboard\`\nShow the top 10 points leaders`,
		threshold: `\`${prefix}threshold role_name 10\`\nSet the role provided to be awards at 10 points\nThis command is only available to admins`,
	}
}

const showHelp = (message, args) => {
	// Embedded help
	const embed = new Discord.MessageEmbed()
		.setTitle('Help')
		.setAuthor(bot.user.username, bot.user.avatarURL())
		.setColor(0xd82929)

	const helpCommand = args[0]

	if (helpCommand && helpCommand in HELP_COMPLETE) {
		// Show the help info for a single command
		embed.setDescription(`Here's some more info about ${helpCommand}`)
		embed.addFields({ name: helpCommand, value: HELP_COMPLETE[helpCommand] })
	} else {
		// Complete help
		embed.setDescription(
			`Here's all the things I can do!\nType \`${prefix}help command\` for more info about a command`,
		)
		for (const [command, value] of Object.entries(HELP_SIMPLE)) {
			embed.addFields({ name: `${prefix}${command}`, value })
		}
	}

	return message.channel.send({ embed })
}

module.exports = {
	initHelp,
	showHelp,
}
