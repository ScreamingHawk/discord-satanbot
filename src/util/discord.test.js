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

test('gets starting with', async t => {
	t.deepEqual(
		createRole('1st Circle - Limbo'),
		await discord.getRoleStartsWith(mockBot, '1st Circle'),
	)
	t.is(null, await discord.getRoleStartsWith(mockBot, 'none')) // No match
	t.deepEqual(
		createRole('4th Circle - Greed'),
		await discord.getRoleStartsWith(mockBot, '4'),
	) // Single character
	t.deepEqual(
		createRole('5th Circle - Wraith'),
		await discord.getRoleStartsWith(mockBot, '5th Circle - Wraith'),
	) // Complete match
})
