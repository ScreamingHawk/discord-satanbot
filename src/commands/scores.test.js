const test = require('ava')
const moment = require('moment')
const scores = require('./scores')

test('gets correct score role', t => {
	t.is('1st Circle', scores.getScoreRole(1)) // On boundary
	t.is('2nd Circle', scores.getScoreRole(11)) // Above boundary
	t.is('5th Circle', scores.getScoreRole(69420)) // Meme
	t.is(null, scores.getScoreRole(0)) // None
})

const mockMessage = {
	reply: () => {},
}

test('gets correct bonus point amount', t => {
	scores.initScores({}, false) // Disable bonus
	t.is(0, scores.getBonusPoints(mockMessage, moment().subtract(1, 'hours')))
	scores.initScores({}, true) // Enable bonus
	t.is(0, scores.getBonusPoints(mockMessage, moment())) // Immediate
	t.is(0, scores.getBonusPoints(mockMessage, moment().subtract(1, 'minutes'))) // 1 minute
	t.is(0, scores.getBonusPoints(mockMessage, moment().subtract(15, 'minutes'))) // Boundary
	t.is(1, scores.getBonusPoints(mockMessage, moment().subtract(16, 'minutes'))) // 1 point
	t.is(10, scores.getBonusPoints(mockMessage, moment().subtract(25, 'minutes'))) // 10 points
	t.is(45, scores.getBonusPoints(mockMessage, moment().subtract(1, 'hours'))) // 1 hour
})
