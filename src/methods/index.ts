import * as bcrypt from "bcrypt";
import * as passportLocal from "passport-local";
import * as JWT from "jsonwebtoken";
import * as passport from "passport";
import { Repository } from "typeorm";
import { Request, Response } from "express";
import { IVerifyOptions } from "passport-local";
import { TokenResponse } from "../classes/TokenResponse";
import { ElfUser } from "../classes/ElfUser";
import { IJwtPayloadUserDetails } from "../interfaces/IJwtPayloadUserDetails";
import { ElfRole } from "../classes/ElfRole";
import { JwtPayload } from "../classes/JwtPayload";
import { ExtractJwt, VerifiedCallback, Strategy } from "passport-jwt";
import { isEmail } from "elf-utils";

const LOCAL_STRATEGY = passportLocal.Strategy;

export const AuthorizeUser = passport.authenticate("bearer-rule", { session: false });

export const AuthenticateUser = (req: Request, resp: Response) => {
	return new Promise<TokenResponse>((resolve, reject) => {
		passport.authenticate("local", { session: false }, async (error, user: ElfUser, info: IVerifyOptions) => {
			if (!!error) {
				return reject(new Error(error.toString()));
			}

			if (!user) {
				return reject(new Error(info.message));
			}

			try {
				const token = await CreateUserSession(req, user);
				return resolve(token);
			} catch (error) {
				return reject(error);
			}
		})(req, resp);
	});
};

export const CreateUserSession = (req: Request, user: ElfUser) => {
	return new Promise<TokenResponse>((resolve, reject) => {
		req.login(user, { session: false }, error => {
			if (!!error) {
				return reject(new Error(error.toString()));
			}
			const token = GetSignedToken(user, process.env.ELF_AUTH_CIPHER_KEY);
			return resolve(new TokenResponse(token));
		});
	});
};

export const GetSignedToken = (user: ElfUser, secretOrPrivateKey?: string, rest?: IJwtPayloadUserDetails, expiresIn: string = "7 days") => {
	secretOrPrivateKey = secretOrPrivateKey || process.env.ELF_AUTH_CIPHER_KEY;
	const { id, email, emailVerified } = user;
	const role = user["role"] as ElfRole;

	let payload = {
		sub: id,
		authTime: Date.now(),
		email,
		emailVerified
	} as JwtPayload;

	if (!!rest) payload = Object.assign(payload, rest);
	if (!!role) payload = Object.assign(payload, { role: role.name, permissions: role.permissions });

	return JWT.sign(payload, secretOrPrivateKey, { expiresIn });
};

export const AuthorizeUserRoles = (req: Request, allowedRoles: Array<string>) => {
	const user = req.user as ElfUser;
	const role = user["role"] as ElfRole;

	if (!allowedRoles || allowedRoles.length < 1) return;
	if (!allowedRoles.includes(role.name)) throw new Error();
};

export const AuthorizeUsers = (req: Request, allowedUsers: Array<string>) => {
	const user = req.user as ElfUser;

	if (!allowedUsers || allowedUsers.length < 1) return;
	if (!allowedUsers.includes(user.id)) throw new Error();
};

export const AuthorizeUserPermissions = (req: Request, key: string) => {
	const user = req.user as ElfUser;
	const role = user["role"] as ElfRole;

	if (!key || key.length < 1) return;
	if (!role.getPermissions().includes(key)) throw new Error();
};

export function InitializeAuthentication<T extends ElfUser>(userRepository: Repository<T>, secretOrPrivateKey?: string) {
	secretOrPrivateKey = secretOrPrivateKey || process.env.ELF_AUTH_CIPHER_KEY;
	// ---------------------------------------------------
	// LOCAL STRATEGY
	// ---------------------------------------------------

	passport.use(
		new LOCAL_STRATEGY(
			{
				usernameField: "email",
				passwordField: "password"
			},
			async (email: string, password: string, callback: any) => {
				const validationResult = isEmail(email);

				if (!validationResult) {
					return callback(null, null, {
						message: "Email address is not valid."
					});
				}

				const user = await userRepository.findOne({ where: { email } });

				if (!!user) {
					if (!!user.isDisabled) {
						return callback(null, null, {
							message: "User is disabled."
						});
					}

					const passwordValidationResult = await bcrypt.compare(password, user.passwordHash);
					if (passwordValidationResult) {
						return callback(null, user, {
							message: "Logged in successfully."
						});
					}
				}

				return callback(null, null, {
					message: "Incorrect email or password."
				});
			}
		)
	);

	// ---------------------------------------------------
	// BEARER RULE
	// ---------------------------------------------------
	passport.use(
		"bearer-rule",
		new Strategy(
			{
				jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
				secretOrKey: secretOrPrivateKey
			},
			async (jwtPayload: any, done: VerifiedCallback) => {
				const id = jwtPayload.sub;
				const user = await userRepository.findOne({ where: { id } });

				if (!!user && !user.isDisabled) {
					const { id } = user;
					const role = user["role"] as ElfRole;
					const authenticatedUser = { id } as T;

					if (!!role) {
						authenticatedUser["role"] = role;
					}

					return done(null, authenticatedUser);
				}

				return done(null, null);
			}
		)
	);
}
