# Kotakode

Unofficial API Wrapper [Kotakode](https://kotakode.com).

# Usage

## Question
```js
const { Question } = require("./index");

new Question("Laravel PHP").get().then(console.log);
```

## User

### Search user by username.
```js
const { User } = require("./index");

new User().get("hansputera").then(console.log);
```

### Top users.
```js
const { User } = require("./index");

new User().tops().then(console.log);
```

### Rising Stars Users.
```js
const { User } = require("./index");

new User().stars().then(console.log);
```