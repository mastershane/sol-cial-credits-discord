import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// Open a database handle
const dbPromise = open({
    filename: './src/db/database.sqlite',
    driver: sqlite3.Database
});

export const query = async (text: string, params: any) => {
    const db = await dbPromise;
    const start = Date.now();
    let res;
    if (text.trim().toLowerCase().startsWith('select')) {
        res = await db.all(text, params);
    } else {
        res = await db.run(text, params);
    }
    const duration = Date.now() - start;
    console.log('executed query', { text, duration });
    // For compatibility with previous code
    return {
        rows: Array.isArray(res) ? res : [],
        rowCount: Array.isArray(res) ? res.length : res.changes || 0
    };
};
