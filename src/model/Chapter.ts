/**
 * User.ts
 * Schema for user collection.
 * Notes:
 * - N/A
 * @author Elias Mawa <elias@emawa.io>
 * Created by Elias Mawa on 19-22-12
 */

import { Schema, Types } from 'mongoose';

const Chapter = new Schema({
	key: {
		type: {
			source: {
				type: String,
				required: true,
				trim: true,
			},
			manga: {
				type: String,
				required: true,
				trim: true,
			},
			chapter: {
				type: Number,
				required: true,
				trim: true,
			},
		},
		required: true,
		trim: true,
		unique: true,
	},
	data: {
		type: {},
		required: true,
		trim: true,
		unique: true,
	},
	lastUpdate: {
		type: Date,
		default: Date.now,
	},
});

export default Chapter;