import { IsEmail } from "class-validator";
import { Column, PrimaryGeneratedColumn } from "typeorm";

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
  @Column({ nullable: true })
  emailVerificationToken: string;
  @Column({ nullable: true })
  passwordResetToken: string;
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
    this.emailVerificationToken = dto.emailVerificationToken;
    this.passwordResetToken = dto.passwordResetToken;
    this.passwordHash = dto.passwordHash;
    this.isDisabled = dto.isDisabled;
  }
}
