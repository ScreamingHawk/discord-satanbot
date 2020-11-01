const test = require('ava')
const sinon = require('sinon')
const roles = require('./roles')
const data = require('../db/data')

const mockThresholds = [
	{
		role: '1st Circle',
		threshold: 1,
	},
	{
		role: '2nd Circle',
		threshold: 10,
	},
	{
		role: '3rd Circle',
		threshold: 100,
	},
	{
		role: '4th Circle',
		threshold: 1000,
	},
	{
		role: '5th Circle',
		threshold: 10000,
	},
	{
		role: '6th Circle',
		threshold: 100000,
	},
].sort((a, b) => (a.threshold > b.threshold ? -1 : 1)) // Reverse order

test('gets correct score role', t => {
	sinon.stub(data, 'getRoleThresholds').returns(mockThresholds)
	t.is('1st Circle', roles.getScoreRole(1)) // On boundary
	t.is('2nd Circle', roles.getScoreRole(11)) // Above boundary
	t.is('5th Circle', roles.getScoreRole(69420)) // Meme
	t.is(null, roles.getScoreRole(0)) // None
})
