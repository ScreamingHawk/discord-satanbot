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

const lessMins = mins => moment().subtract(mins, 'minutes')

test('gets correct bonus point amount', t => {
	const bonus = time => scores.getBonusPoints(mockMessage, time)
	scores.initScores({}, false) // Disable bonus
	t.is(0, bonus(moment().subtract(1, 'hours')))
	scores.initScores({}, true) // Enable bonus
	t.is(0, bonus(moment())) // Immediate
	t.is(0, bonus(lessMins(1))) // 1 minute
	t.is(0, bonus(lessMins(scores.DEAD_SERVER_MINUTES))) // Boundary
	t.is(1, bonus(lessMins(scores.DEAD_SERVER_MINUTES + 1))) // 1 point
	t.is(
		2,
		bonus(
			lessMins(
				scores.DEAD_SERVER_MINUTES + scores.DEAD_SERVER_PMINS_PER_POINT + 1,
			),
		),
	) // 2 points
	t.is(8, bonus(moment().subtract(1, 'hours'))) // 1 hour
	t.is(38, bonus(moment().subtract(2, 'hours'))) // 2 hours
})

test('skips points earning on ignored channels', t => {
	const setScoreStub = sinon.stub(database, 'setScore')
	sinon.stub(database, 'listScoreIgnore').returns([{ channel }])
	scores.initScores({}, true)

	scores.incrementPoints(mockMessage)

	t.false(setScoreStub.called)
})
