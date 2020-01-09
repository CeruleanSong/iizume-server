/**
 * User.ts
 * Schema for user collection.
 * Notes:
 * - N/A
 * @author Elias Mawa <elias@emawa.io>
 * Created by Elias Mawa on 19-22-12
 */

import { Schema, Types } from 'mongoose';

/**
 * User in the database.
 */
const User = new Schema({
	username: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
	},
	admin: {
		type: Boolean,
		required: false,
		default: false,
	},
	passLastEdit: {
		type: Date,
		default: Date.now,
	},
	created: {
		type: Date,
		default: Date.now,
	},
});

export default User;