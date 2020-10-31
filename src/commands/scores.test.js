const test = require('ava')
const scores = require('./scores')

test('gets correct score role', t => {
	t.is('1st Circle', scores.getScoreRole(1)) // On boundary
	t.is('2nd Circle', scores.getScoreRole(11)) // Above boundary
	t.is('5th Circle', scores.getScoreRole(69420)) // Meme
	t.is(null, scores.getScoreRole(0)) // None
})
