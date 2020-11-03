const test = require('ava')
const database = require('./database')

test.before(() => {
	database.initDatabase()
})

test('score ignore database works', t => {
	const ignore = {
		channel: '123',
	}
	database.removeScoreIgnore(ignore) // Remove potential held over entry
	const startList = database.listScoreIgnore()

	// Add an entry
	database.addScoreIgnore(ignore)
	let newList = database.listScoreIgnore()

	// Confirm added
	t.is(startList.length + 1, newList.length)
	t.deepEqual(ignore, newList[newList.length - 1])

	// Remove
	database.removeScoreIgnore(ignore)
	newList = database.listScoreIgnore()

	// Confirm removed
	t.deepEqual(startList, newList)
})
