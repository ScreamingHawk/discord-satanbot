const test = require('ava')
const moment = require('moment')
const scores = require('./scores')

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
	t.is(2, scores.getBonusPoints(mockMessage, moment().subtract(20, 'minutes'))) // 2 points
	t.is(10, scores.getBonusPoints(mockMessage, moment().subtract(1, 'hours'))) // 1 hour
})
