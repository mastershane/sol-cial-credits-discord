import { query } from '../db/index.js';
import { updateBalance } from './user-repo.js';

export type EventType = 'Add' | 'Remove' | 'Name';

export interface IEvent {
	type: EventType,
	initiatorId: string,
	targetId: string,
	value: number,
	createdOn: Date
	text: string,
}

export const saveEvent = async (event: IEvent) => {
	const sql = 'insert into event (type, initiator_id, target_id, value, created_on, text) values (?, ?, ?, ?, ?, ?)'
	const result = await query(sql, [event.type, event.initiatorId, event.targetId, event.value, new Date().toISOString(), event.text]);
}

export const handleEvent = async (event: IEvent) => {
	switch(event.type){
		case 'Add':
			await updateBalance(event.targetId, event.value);
			break;
		case 'Remove':
			await updateBalance(event.targetId, -event.value);
			break;
		case 'Name':
			await query('UPDATE discord_user SET name = ? WHERE user_id = ?', [event.text, event.targetId]);	
			break;
		default:
			throw Error(`Event Type ${event.type} not implemented.`)
	}
}