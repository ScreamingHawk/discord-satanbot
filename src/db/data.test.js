const test = require('ava')
const sinon = require('sinon')
const data = require('./data')
const database = require('./database')

const mockThresholds = [
	{
		role: '2nd',
		threshold: 2,
	},
	{
		role: '1st',
		threshold: 1,
	},
	{
		role: '3rd',
		threshold: 3,
	},
]

let listStub

test.afterEach(() => {
	listStub.restore()
})

test.serial('sorts on init', t => {
	// Given
	listStub = sinon.stub(database, 'listRoleThresholds').returns(mockThresholds)

	// When
	data.initData(mockThresholds)

	// Then
	const actual = data.getRoleThresholds()
	t.is(3, actual.length)
	t.is('3rd', actual[0].role)
	t.is(3, actual[0].threshold)
	t.is('2nd', actual[1].role)
	t.is('1st', actual[2].role)
	t.is(1, actual[2].threshold)
})

test.serial('updating role thresholds resets data', t => {
	// Given
	const threshold = {
		role: '1st',
		threshold: 1,
	}
	listStub = sinon
		.stub(database, 'listRoleThresholds')
		.onFirstCall()
		.returns([])
		.onSecondCall()
		.returns([threshold])
	data.initData()
	const setStub = sinon.stub(database, 'setRoleThreshold')

	// When
	data.updateRoleThreshold(threshold)

	// Then
	const actual = data.getRoleThresholds()
	t.is(1, actual.length)
	t.deepEqual(threshold, actual[0])
	t.true(listStub.calledTwice)
	t.true(setStub.calledOnce)
})
