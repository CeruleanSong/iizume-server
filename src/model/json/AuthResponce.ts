/**
 * User.ts
 * Schema for user collection.
 * Notes:
 * - N/A
 * @author Elias Mawa <elias@emawa.io>
 * Created by Elias Mawa on 19-22-12
 */

/**
 * Responce returned on valid authentication
 */
interface AuthResponce {
	user: {
		email: string,
		username: string,
	};
	authorization: string;
}

export default AuthResponce;