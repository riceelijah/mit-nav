# Passwords

Ben has no Commons account, so he signs up with a username and a password. Registering stores his username, and Authenticating stores a verifier derived from his password. These endpoints call both, then start a session with Sessioning. An app copies this composition with [accounts](Accounts.md), and its frontend shows a password form.

The [register endpoint](reaction:Passwords.entering.Register) first calls `Authenticating._acceptable`. When the password is too short or too long, the request is refused with `INVALID_PASSWORD` before anyone is registered, because the engine doesn't undo `Registering.register` when a later action in the same request is refused. Otherwise the endpoint registers the username, sets the password for the new user, and starts a session. Because the endpoint always registers a new user, nobody can sign up with a password as Sam after he signed in with Commons: the request is refused by `Registering.register` with `USERNAME_TAKEN`. For any caller, a password outside those lengths is still refused by `Authenticating.set` with `INVALID_PASSWORD`, and a second password for the same user with `PASSWORD_SET`.

The [sign-in endpoint](reaction:Passwords.entering.SignIn) calls `Registering._byUsername` for the user, checks the password with `Authenticating.authenticate`, and starts a new session. A username nobody has is refused with `INVALID_CREDENTIALS`, the same refusal as a wrong password. Sam, who has no password, is refused the same way.

Each endpoint responds with the user, the session, and its expiry, and the HTTP server moves the session into a cookie that the page's scripts can't read, as `passwordsHttp` beside the endpoints declares.

```endpoints
Passwords.entering.Register at /auth/register
Passwords.entering.SignIn at /auth/login
```

If `Authenticating.set` or `Sessioning.start` fails after `Registering.register` has succeeded, for example because the database stops answering, the username stays registered with no password, and signing up again with it is refused with `USERNAME_TAKEN`. The engine doesn't undo the registration, and this composition offers no repair; the person picks another username. This is accepted, as in ConceptBox, because it needs a failure between two writes of one request.
