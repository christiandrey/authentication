export class JwtPayload {
	sub: string;
	authTime: number;
	email: string;
	givenName: string;
	familyName: string;
	emailVerified: boolean;
	role: string;
	permissions: string;

	/**
	 *
	 */
	constructor(dto: Partial<JwtPayload> = {}) {
		this.sub = dto.sub;
		this.authTime = dto.authTime;
		this.email = dto.email;
		this.givenName = dto.givenName;
		this.familyName = dto.familyName;
		this.emailVerified = dto.emailVerified;
		this.role = dto.role;
		this.permissions = dto.permissions;
	}
}
