export class TokenResponse {
	token: string;
	expiresIn: number;
	tokenType: string;

	/**
	 *
	 */
	constructor(token: string, expiresIn = 7 * 24 * 60 * 60) {
		this.token = token;
		this.expiresIn = expiresIn;
		this.tokenType = "Bearer";
	}
}
