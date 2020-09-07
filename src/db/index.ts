import { Pool, QueryResult } from 'pg';

const pool = new Pool({
	connectionString: 'postgresql://postgres:8oatTrip8@localhost:5432/sol-cial-credits',
	ssl: false
});

export const query = async (text: string, params: any ) => {
	const start = Date.now();
	const res =  await pool.query(text, params);
	const duration = Date.now() - start;
	console.log('executed query', { text, duration, rows: res.rowCount });
	return res;
};
