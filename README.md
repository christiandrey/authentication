# Elf Authentication

Elf Authentication is a set of classes, methods and decorators to aid with authentication when using TypeORM and Express.

## Classes

---

It exports a base `ElfUser` model class, which can be extended in the target project to include more properties related to the user, and a base `ElfRole` class, for adding user roles.

### ElfUser

---

> The `ElfUser`class contains the following properties:

- `id`
- `username`
- `email`
- `emailVerified`
- `emailVerificationToken`
- `passwordResetToken`
- `passwordHash`
- `isDisabled`

### ElfRole

---

> The `ElfRole` class contains the following properties:

- `id`
- `name`
- `permissions`

## Decorators

---

Elf Authentication provides the following decorators for use in controllers.

### @AuthorizeRoutes()

---

> Decorate a controller class with this to apply authorization to all methods within that controller.

### @Authorize()

---

> Decorate a class method with this to apply authorization to just that method.

### @AllowAnonymous()

---

> Use this decorator to exempt a method from inherited authorization, such as one initiated with the `AuthorizeRoutes` decorator.

The `AuthorizeRoutes` and `Authorize` decorators accept options as an optional parameter. Set the `checkPermissions` flag to `true` to also authorize user permissions.

## Methods

---

Elf Authentication makes available the following helper methods.

### InitializeAuthentication

---

> Use this to initialize authentication. Provide as first parameter, a reference to the TypeORM User Repository e.g. `InitializeAuthentication(getRepository(User))`. This is typically done before once a DB Connection has been made.

### AuthenticateUser

---

> Use this asynchronous method to authenticate a user. It's typically used at login, and accepts the express `request` and `response` objects. It returns a `TokenResponse` which contains `token`, `expiresIn` and `tokenType` e.g. `const token = await AuthenticateUser(req, resp)`

### CreateUserSession

---

> Use this asynchronous method to create a user session from a user. It's typically used after creating a user and accepts the `request` object and a user object. It also returns a `TokenResponse`. e.g. `const token = await CreateUserSession(req, createdUser)`

## Customising

---

The following environment variables are available to use to customise the authorization process:
| Tables | Are |
| ------------- |-------------|
| **ELF_AUTH_CIPHER_KEY** | Use this to define an encryption key for authorization. |
| **ELF_AUTH_EXPIRES_IN** | Use this to customise how long the generated access token is valid for. The default value is `7 days`. |
