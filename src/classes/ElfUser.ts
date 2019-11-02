import { PrimaryGeneratedColumn, Column } from "typeorm";
import { IsEmail } from "class-validator";

export abstract class ElfUser {
	@PrimaryGeneratedColumn("uuid")
	id: string;
	@Column({ nullable: true })
	username: string;
	@Column({ unique: true })
	@IsEmail()
	email: string;
	@Column({ default: false })
	emailVerified: boolean;
	@Column({ nullable: false })
	passwordHash: string;
	@Column({ default: false })
	isDisabled: boolean;

	/**
	 *
	 */
	constructor(dto: Partial<ElfUser> = {}) {
		this.id = dto.id;
		this.username = dto.username;
		this.email = dto.email;
		this.emailVerified = dto.emailVerified;
		this.passwordHash = dto.passwordHash;
		this.isDisabled = dto.isDisabled;
	}
}
