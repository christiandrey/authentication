import { Column } from "typeorm";

export abstract class ElfRole {
	@Column({ nullable: false })
	name: string;

	/**
	 *
	 */
	constructor(dto: Partial<ElfRole> = {}) {
		this.name = dto.name;
	}
}
