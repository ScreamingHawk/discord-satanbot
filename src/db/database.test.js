const test = require('ava')
const database = require('./database')

test.before(() => {
	database.initDatabase()
})

test('score ignore table works', t => {
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

test('self assign table works', t => {
	const selfAssign = {
		role: '123',
	}
	database.removeSelfAssign(selfAssign) // Remove potential held over entry
	t.false(database.isSelfAssign(selfAssign))

	// Add an entry
	database.addSelfAssign(selfAssign)
	t.true(database.isSelfAssign(selfAssign))

	// Remove
	database.removeSelfAssign(selfAssign)
	t.false(database.isSelfAssign(selfAssign))
})
