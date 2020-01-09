/**
 * bcrypt.ts
 * Wrapper for performing bcrypt functions anycronously.
 * Notes:
 * - N/A
 * @author Elias Mawa <elias@emawa.io>
 * Created 19-22-12
 */

import bcrypt from "bcrypt";
import config from "../../res/config.json";

const salt_rounds = config.crypt.rounds;

/**
 * Generates a salt.
 * @param rounds Round's salt must undergo .
 */
const gen_salt = (rounds: number) => new Promise((resolve, reject) => {
	bcrypt.genSalt(rounds, (err, salt) => {
		if(err)
		{
			reject(err);
		}
		else
		{
			resolve(salt);
		}
	});
});

/**
 * Hash a specified string.
 * @param data String to be hashed.
 */
const gen_hash = (data: string) => new Promise((resolve, reject) => {
	bcrypt.hash(data, salt_rounds, (err, hash) => {
		if(err)
		{
			reject(err);
		}
		else
		{
			resolve(hash);
		}
	});
});

/**
 * Compare a hash and a string.
 * @param data Data to match against hash.
 * @param hash Hash to compare data with.
 */
const compare = (data: string, hash: string) => new Promise((resolve, reject) => {
	bcrypt.compare(data, hash, (err, res) =>{
		if(err)
		{
			reject(err);
		}
		else
		{
			resolve(res);
		}
	});
});

export default {
	gen_hash,
	compare,
};