const test = require('ava')
const sinon = require('sinon')
const moment = require('moment')
const scores = require('./scores')
const database = require('../db/database')

const channel = 123
const mockMessage = {
	reply: () => {},
	channel: {
		id: channel,
	},
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

test('skips points earning on ignored channels', t => {
	const setScoreStub = sinon.stub(database, 'setScore')
	sinon.stub(database, 'listScoreIgnore').returns([{ channel }])
	scores.initScores({}, true)

	scores.incrementPoints(mockMessage)

	t.false(setScoreStub.called)
})
