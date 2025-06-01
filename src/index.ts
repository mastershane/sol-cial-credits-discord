import express from 'express';
import { MessageMatchBotRunner } from './bot.js';
import bodyParser from 'body-parser';
import dotEnv from 'dotenv';
import { CommandMatchBot, InfoMatchBot } from './match-bot.js';
import { query } from './db/index.js';

dotEnv.config();
const b = new MessageMatchBotRunner([new InfoMatchBot(), new CommandMatchBot()]);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.get('/', async (req, res) => {
  const dbres = await query('SELECT $1::text as message', ['Hello world!'])
  console.log(dbres.rows[0].message) // Hello world!
  res.send("Hey, I'm Cool Guy.");
});

app.get('/users', async (req, res) => {
  try {
    const users = await query('SELECT * FROM discord_user', []);
    res.json(users.rows);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to fetch users', details: errorMsg });
  }
});

app.post('/users/:userId/name', async (req, res) => {
  const { userId } = req.params;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    await query('UPDATE discord_user SET name = ? WHERE user_id = ?', [name, userId]);
    res.json({ success: true });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to update user name', details: errorMsg });
  }
});

const port = Number(process.env.PORT || 5654);
app.listen(port)

