const test = require('ava')
const discord = require('./discord')

const createRole = name => ({
	name,
})

const mockGuild = {
	roles: {
		cache: [
			createRole('1st Circle - Limbo'),
			createRole('2nd Circle - Lust'),
			createRole('3rd Circle - Gluttony'),
			createRole('4th Circle - Greed'),
			createRole('5th Circle - Wraith'),
			createRole('6th Circle - Heresy'),
		],
	},
}

const mockBot = {
	guilds: {
		cache: {
			first: () => mockGuild,
		},
	},
}

test('returns first guild', async t => {
	t.is(mockGuild, await discord.getGuild(mockBot))
})
