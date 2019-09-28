import { initializeRoutesMetadata, ROUTES_METADATA_KEY, IRouteDefinition } from "elf-utils";
import { IAuthorizeOptions } from "../interfaces/IAuthorizeOptions";
import { PREFIX_AUTH_METADATA_KEY } from "elf-utils/src/constants";

export const AuthorizeRoutes = (options?: IAuthorizeOptions): ClassDecorator => {
	return (target: Object) => {
		initializeRoutesMetadata(target);

		Reflect.defineMetadata(PREFIX_AUTH_METADATA_KEY, true, target);

		// let routes = Reflect.getMetadata(ROUTES_METADATA_KEY, target) as Array<IRouteDefinition>;
		// routes = routes.map(o => ({ ...o, authorize: true }));

		// Reflect.defineMetadata(ROUTES_METADATA_KEY, routes, target);
	};
};

export const Authorize = (options?: IAuthorizeOptions): MethodDecorator => {
	return (target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor) => {
		initializeRoutesMetadata(target.constructor);

		const routes = Reflect.getMetadata(ROUTES_METADATA_KEY, target.constructor) as Array<IRouteDefinition>;
		const index = routes.findIndex(o => o.action === propertyName);
		const payload = {
			action: propertyName,
			authorize: true
		} as IRouteDefinition;

		if (index < 0) {
			routes.push(payload);
		} else {
			routes[index] = Object.assign(routes[index], payload);
		}

		Reflect.defineMetadata(ROUTES_METADATA_KEY, routes, target.constructor);
	};
};

export const AllowAnonymous = (): MethodDecorator => {
	return (target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor) => {
		initializeRoutesMetadata(target.constructor);

		const routes = Reflect.getMetadata(ROUTES_METADATA_KEY, target.constructor) as Array<IRouteDefinition>;
		const index = routes.findIndex(o => o.action === propertyName);
		const payload = {
			action: propertyName,
			allowAnonymous: true
		} as IRouteDefinition;

		if (index < 0) {
			routes.push(payload);
		} else {
			routes[index] = Object.assign(routes[index], payload);
		}

		Reflect.defineMetadata(ROUTES_METADATA_KEY, routes, target.constructor);
	};
};
