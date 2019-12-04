import { Column, PrimaryGeneratedColumn } from "typeorm";
import { IsNotEmpty } from "class-validator";

export abstract class ElfRole {
	@PrimaryGeneratedColumn("uuid")
	id: string;
	@Column({ nullable: false })
	@IsNotEmpty()
	name: string;
	@Column({ type: "longtext", nullable: true })
	permissions: string;

	getPermissions(): Array<string> {
		const permissions = this.permissions;
		if (!permissions || permissions.length === 0) return [];
		return permissions.split(";");
	}

	setPermissions(permissions: Array<string>) {
		if (!permissions) return;
		this.permissions = permissions.join(";");
	}

	/**
	 *
	 */
	constructor(dto: Partial<ElfRole> = {}) {
		this.id = dto.id;
		this.name = dto.name;
		this.permissions = dto.permissions;
	}
}
