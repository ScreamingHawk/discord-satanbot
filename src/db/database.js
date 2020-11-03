const SQLite = require('better-sqlite3')
const sql = new SQLite('./database.sqlite')
const log = require('../util/logger')

const initDatabase = () => {
	// Score table
	let table = sql
		.prepare(
			'SELECT count(*) FROM sqlite_master WHERE type = \'table\' AND name = \'scores\';',
		)
		.get()
	if (!table['count(*)']) {
		log.info('Creating score table')
		sql
			.prepare('CREATE TABLE scores (user TEXT PRIMARY KEY, points INTEGER);')
			.run()
		sql.prepare('CREATE UNIQUE INDEX idx_scores_id ON scores (user);').run()
		// Set some SQL things
		sql.pragma('synchronous = 1')
		sql.pragma('journal_mode = wal')
	}
	// Role Threshold table
	table = sql
		.prepare(
			'SELECT count(*) FROM sqlite_master WHERE type = \'table\' AND name = \'role_thresholds\';',
		)
		.get()
	if (!table['count(*)']) {
		log.info('Creating role thresholds table')
		sql
			.prepare(
				'CREATE TABLE role_thresholds (role TEXT PRIMARY KEY, threshold INTEGER);',
			)
			.run()
		sql
			.prepare(
				'CREATE UNIQUE INDEX idx_role_threshold_id ON role_thresholds (role);',
			)
			.run()
	}
	// Score Ignore table
	table = sql
		.prepare(
			'SELECT count(*) FROM sqlite_master WHERE type = \'table\' AND name = \'score_ignore\';',
		)
		.get()
	if (!table['count(*)']) {
		log.info('Creating score ignore table')
		sql.prepare('CREATE TABLE score_ignore (channel TEXT PRIMARY KEY);').run()
		sql
			.prepare(
				'CREATE UNIQUE INDEX idx_score_ignore_id ON score_ignore (channel);',
			)
			.run()
	}
}

const getScore = userId => {
	let score = sql.prepare('SELECT * FROM scores WHERE user = ?').get(userId)
	if (!score) {
		// Initialise score
		score = {
			user: userId,
			points: 0,
		}
	}
	return score
}

// Scores

const listScores = limit =>
	sql.prepare('SELECT * FROM scores ORDER BY points DESC LIMIT ?;').all(limit)

const setScore = score => {
	sql
		.prepare(
			'INSERT OR REPLACE INTO scores (user, points) VALUES (@user, @points);',
		)
		.run(score)
}

// Role thresholds

const listRoleThresholds = () =>
	sql.prepare('SELECT * FROM role_thresholds ORDER BY threshold DESC;').all()

const setRoleThreshold = threshold => {
	sql
		.prepare(
			'INSERT OR REPLACE INTO role_thresholds (role, threshold) VALUES (@role, @threshold);',
		)
		.run(threshold)
}

// Score ignore

const listScoreIgnore = () => sql.prepare('SELECT * FROM score_ignore;').all()

const addScoreIgnore = ignore => {
	sql
		.prepare('INSERT OR REPLACE INTO score_ignore (channel) VALUES (@channel);')
		.run(ignore)
}
const removeScoreIgnore = ignore => {
	sql.prepare('DELETE FROM score_ignore where channel = @channel;').run(ignore)
}

module.exports = {
	initDatabase,
	getScore,
	listScores,
	setScore,
	listRoleThresholds,
	setRoleThreshold,
	listScoreIgnore,
	addScoreIgnore,
	removeScoreIgnore,
}
