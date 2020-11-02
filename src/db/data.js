const database = require('./database')

let roleThresholds

const initData = () => {
	roleThresholds = database
		.listRoleThresholds()
		.sort((a, b) => (a.threshold > b.threshold ? -1 : 1)) // Reverse order
}

const getRoleThresholds = () => {
	if (!roleThresholds) {
		initData()
	}
	return roleThresholds
}

const updateRoleThreshold = threshold => {
	database.setRoleThreshold(threshold)
	initData()
}

module.exports = {
	initData,
	getRoleThresholds,
	updateRoleThreshold,
}
