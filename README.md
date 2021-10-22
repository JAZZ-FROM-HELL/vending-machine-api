<h2>vending-machine-api</h2>

<h3>Yuval Ron</h3>


## Description

API vending machine challenge

Typescript + NestJS


## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```


## Exercise brief
Design an API for a vending machine, allowing users with a “seller” role to add, update or remove products, while users with a “buyer” role can deposit coins into the machine and make purchases. Your vending machine should only accept 5, 10, 20, 50 and 100 cent coins

### Tasks

- REST API should be implemented consuming and producing “application/json”
- Implement product model with amountAvailable, cost, productName and sellerId fields
- Implement user model with username, password, deposit and role fields
- Implement CRUD for users (POST shouldn’t require authentication)
- Implement CRUD for a product model (GET can be called by anyone, while POST, PUT and DELETE can be called only by the seller user who created the product)
- Implement /deposit endpoint so users with a “buyer” role can deposit 5, 10, 20, 50 and 100 cent coins into their vending machine account
- Implement /buy endpoint (accepts productId, amount of products) so users with a “buyer” role can buy products with the money they’ve deposited. API should return total they’ve spent, products they’ve purchased and their change if there’s any (in 5, 10, 20, 50 and 100 cent coins)
- Implement /reset endpoint so users with a “buyer” role can reset their deposit
- Take time to think about possible edge cases and access issues that should be solved

### Evaluation criteria:

- Node.js/Framework of choice best practices
- Edge cases covered
- Write API tests for all implemented endpoints
- Code readability and optimization

### Bonus:

Attention to security

-----

### Comments / Assumptions:


- sellerId wasn't exactly defined, so it will be defined as the username of the product's owner.

- Although the app uses a "mock" array repository, it was important for me to use async/await and Promises in order to make this a little more realistic, as it would be with real database persistence.

- Not persisting the session with cookies / tokens. APIs are typically stateless, however an api key was not defined in this spec, so each request to a secure endpoint will require a username and password as URL query params as an alternative (except /user, see next point).

- in /user endpoints, we are using the persisted User itself for authentication. for the reason why please see comment at the top of UserController.

- /user security: clearly the required CRUD service for users, exposing all their info and letting them set their own deposit would create a significant vulnerability in a real-world app :)

- Product service: since the smallest change is 5, the service validates that product prices are in multiples of 5.

- /buy endpoint - the spec doesn't address a few business scenarios:
- the user doesn't have enough change. in such case the API will return a 403.
- the requested product units is larger than the available amount. in such case returning a 404.
- the buyer can technically pay, but their balance doesn't allow for exact change. For instance: buying a product for 50, when there are only 4 coins of 20. Also in such case, a 404 will be returned.
- in either case, if the purchase can not be completed nothing changes.


