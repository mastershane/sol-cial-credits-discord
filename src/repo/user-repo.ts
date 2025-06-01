import { query } from '../db/index.js';

export interface IUser {
	userId: string;
	name: string;
	balance: number;
}

const initialBalance = 10000;

export const getUser = async (userId: string, name: string | undefined) => {
	let results = await query('SELECT * FROM discord_user WHERE user_id = ?', [userId]);
	let row = results.rows[0];
	if (!row) {
		// Insert a new user with default values if not found
		await query('INSERT INTO discord_user (user_id, name, balance) VALUES (?, ?, ?)', [userId, name ?? userId, initialBalance]);
		results = await query('SELECT * FROM discord_user WHERE user_id = ?', [userId]);
		row = results.rows[0];
	}
	const user: IUser =  {
		userId: row?.user_id,
		name: row?.name,
		balance: row?.balance,
	};
	return user;
};

export const getUsers = async () => {
	const results = await query('SELECT * FROM discord_user', []);
	const users: IUser[] =  results.rows.map(r => ({
		userId: r.user_id,
		name: r.name,
		balance: r.balance,
	}))
	return users;
}

export const updateBalance = async (userId: string, score: number) => {
	const results = await query('UPDATE discord_user SET balance = balance + ? WHERE user_id = ?', [score, userId]);
}