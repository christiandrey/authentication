import "reflect-metadata";

function f() {
	console.log("F evaluated");
	return function(target) {
		console.log("F called");
	};
}

function g() {
	console.log("G evaluated");
	return function(target, propertyKey, descriptor) {
		console.log("G called");
	};
}

function h() {
	console.log("H evaluated");
	return function(target, propertyKey, descriptor) {
		console.log("H called");
	};
}

const PREFIX_METADATA_KEY = Symbol("prefix");
const ROUTES_METADATA_KEY = Symbol("routes");
type HttpRequestType = "get" | "post" | "put" | "patch" | "delete";

interface IRouteDefinition {
	path: string;
	action: string;
	requestType: HttpRequestType;
	authorize: boolean;
	allowAnonymous: boolean;
	checkPermissions?: boolean;
	users?: Array<string>;
	roles?: Array<string>;
}

interface IAuthorizeOptions {
	checkPermissions?: boolean;
	users?: Array<string>;
	roles?: Array<string>;
}

const AuthorizeRoutes = (options?: IAuthorizeOptions): ClassDecorator => {
	return (target: Object) => {
		initializeRoutesMetadata(target);

		let routes = Reflect.getMetadata(ROUTES_METADATA_KEY, target) as Array<IRouteDefinition>;
		routes = routes.map(o => ({ ...o, ...options, authorize: true }));

		Reflect.defineMetadata(ROUTES_METADATA_KEY, routes, target);
	};
};

const Controller = (prefix: string = ""): ClassDecorator => {
	return (target: Object) => {
		Reflect.defineMetadata(PREFIX_METADATA_KEY, prefix, target);

		// ----------------------------------------------------------------
		// REGISTER ROUTES METADATA FOR CONTROLLER IF IT DOES NOT EXIST
		// ----------------------------------------------------------------
		initializeRoutesMetadata(target);
	};
};

const HttpGet = (path: string): MethodDecorator => {
	return (target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor) => {
		updateRoutesMetadata("get", path, target.constructor, propertyName);
	};
};

const initializeRoutesMetadata = (target: Object) => {
	if (!Reflect.hasMetadata(ROUTES_METADATA_KEY, target)) {
		Reflect.defineMetadata(ROUTES_METADATA_KEY, [], target);
	}
	console.log("META", Reflect.getMetadata(ROUTES_METADATA_KEY, target));
};

const updateRoutesMetadata = (requestType: HttpRequestType, path: string, target: Object, propertyName: string) => {
	initializeRoutesMetadata(target);

	const routes = Reflect.getMetadata(ROUTES_METADATA_KEY, target) as Array<IRouteDefinition>;
	const index = routes.findIndex(o => o.action === propertyName);
	const payload = {
		path,
		requestType,
		action: propertyName
	} as IRouteDefinition;

	if (index < 0) {
		routes.push(payload);
	} else {
		routes[index] = Object.assign(routes[index], payload);
	}

	Reflect.defineMetadata(ROUTES_METADATA_KEY, routes, target);
};

@Controller("test")
@AuthorizeRoutes()
class C {
	@HttpGet("hello")
	method() {}
}

@Controller("test2")
@AuthorizeRoutes()
class D {
	@HttpGet("hello2")
	method() {}
}
