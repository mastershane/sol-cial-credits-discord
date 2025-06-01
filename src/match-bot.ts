import { DiscordMessage } from "./bot";
import { getUser, getUsers } from './repo/user-repo.js';
import { IEvent, saveEvent, handleEvent } from './repo/event-repo.js';

export interface MatchResult {
	responseText: string;
	isMatch: boolean;
}
export type CommandAction = 'Add' | 'Remove' | 'Name';
export interface CreditCommand {
	action: CommandAction;
	justification: string;
	targets: string[];
}

export interface IMatchBot {
	match: (message: DiscordMessage) => Promise<MatchResult>
}


export class InfoMatchBot implements IMatchBot {
	public async match(message: DiscordMessage) {
		if (message.text.startsWith('!balance')) {
			const user = await getUser(message.user_id, message.user_name);
			return { isMatch: true, responseText: `Your current balance is ${user.balance}` };
		}

		if (message.text.startsWith('!ranking')) {
			const users = await getUsers();
			users.sort((a, b) => {
				return b.balance - a.balance;
			});
			const text = users.map(u => u.name + ": " + u.balance).join('\r\n');
			return { isMatch: true, responseText: text };
		}

		return { isMatch: false, responseText: '' };

	};
}

const mentionRegex = /<@\d+>/g;

// tslint:disable-next-line: max-classes-per-file
export class CommandMatchBot implements IMatchBot {

	public async match(message: DiscordMessage) {

		const command = this.getCommand(message.text, message.user_id);
		if (command == null || command.targets.length === 0) {
			return { isMatch: false, responseText: '' };
		}
		// todo: this should probably be itsown handler
		if (command.action === 'Name') {
			const nameEvent: IEvent = {
				type: command.action,
				initiatorId: message.user_id,
				targetId: command.targets[0],
				value: 0,
				createdOn: new Date(),
				text: command.justification,
			}
			await handleEvent(nameEvent);
			return { isMatch: true, responseText: `Your name has been set to ${command.justification}` };
		}

		// get initaitor user from repo
		const initiator = await getUser(message.user_id, message.user_name);
		const points = Math.round(initiator.balance / 100);
		const targetNames: string[] = [];
		for (const target of command.targets) {
			const user = await getUser(target, message.mentions.get(target)?.username);
			const event: IEvent = {
				type: command.action,
				initiatorId: message.user_id,
				targetId: target,
				value: points,
				createdOn: new Date(),
				text: command.justification,
			}
			await saveEvent(event);
			await handleEvent(event);
			targetNames.push(user.name);
		}

		return { isMatch: true, responseText: ` ${points} credits ${command.action === 'Add' ? 'added to' : 'removed from'} ${targetNames.join(', ')}` };
	}

	private getCommand(text: string, senderId: string): CreditCommand | null {
		const mentions = text.match(mentionRegex)
			?.map(m => m.replace(/<@/, '').replace(/>/, '')) ?? [];

		const runningText = text.trim();
		if (text.startsWith("+cred")) {
			return {
				action: 'Add',
				justification: runningText.substring(5),
				targets: mentions,
			}
		}


		if (text.startsWith("-cred")) {
			return {
				action: 'Remove',
				justification: runningText.substring(5),
				targets: mentions,
			}

		}

		if (text.startsWith("!name")) {
			return {
				action: 'Name',
				justification: runningText.substring(5).trim(),
				targets: [senderId],
			}

		}

		return null;

	}
}
