import { Client, GatewayIntentBits } from 'discord.js';
import { IMatchBot } from './match-bot';


export interface DiscordMessage {
  text: string;
  sender_type: 'user' | 'bot',
  source_guid: string,
  user_id: string,
  attachments: Attachment[]
}

export interface Attachment {
  type: string
}

export class MessageMatchBotRunner {
  private _bots: IMatchBot[];
  private client: Client;

  constructor(bots: IMatchBot[]) {
    this._bots = bots;
    this.client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
    this.initialize();
  }

  private initialize() {
    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user?.tag}!`);
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;

      console.log(`Received message: ${message.content}`);

      for (const bot of this._bots) {
        const match = await bot.match({
          text: message.content,
          sender_type: 'user',
          source_guid: message.id,
          user_id: message.author.id,
          attachments: []
        });

        if (match.isMatch) {
          await message.channel.send(match.responseText);
          return;
        }
      }
    });

    this.client.login(process.env.DISCORD_CLIENT_TOKEN);
  }
}
