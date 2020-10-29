const SQLite = require('better-sqlite3')
const sql = new SQLite('./database.sqlite')
const log = require('../util/logger')

const initDatabase = () => {
	const table = sql
		.prepare(
			'SELECT count(*) FROM sqlite_master WHERE type = \'table\' AND name = \'scores\';',
		)
		.get()
	if (!table['count(*)']) {
		log.info('Creating database')
		// If the table isn't there, create it and setup the database correctly.
		sql
			.prepare('CREATE TABLE scores (user TEXT PRIMARY KEY, points INTEGER);')
			.run()
		// Ensure that the "user" row is always unique and indexed.
		sql.prepare('CREATE UNIQUE INDEX idx_scores_id ON scores (user);').run()
		sql.pragma('synchronous = 1')
		sql.pragma('journal_mode = wal')
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

const listScores = limit =>
	sql.prepare('SELECT * FROM scores ORDER BY points DESC LIMIT ?;').all(limit)

const setScore = score => {
	sql
		.prepare(
			'INSERT OR REPLACE INTO scores (user, points) VALUES (@user, @points);',
		)
		.run(score)
}

module.exports = {
	initDatabase,
	getScore,
	listScores,
	setScore,
}
