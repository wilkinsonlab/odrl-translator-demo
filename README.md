![](./screenshots/1.png)

![](./screenshots/2.png)

# Prerequisites

- Node.js v16.0.0 or higher
- PNPM or NPM or Yarn

# How to use

1. Go to the server folder and run the following commands:

```sh
pnpm install

# after installation, run:

pnpm run dev
```

2. Go to the frontend folder and run the following commands:

```sh
pnpm install

# after installation, run:

pnpm run dev
```

3. Now, you can visit [http://127.0.0.1:5173/](http://127.0.0.1:5173/) and test the ODRL Translator from the web interface. To test the ODRL Builder, go to [http://127.0.0.1:5173/policy_creator](http://127.0.0.1:5173/policy_creator).

- The ODRL translator API is located at http://localhost:3000 (or http://127.0.0.1:3000), but you don't have to visit this URL.

You can also use Docker to run run the server and the web interface in one go:

```sh
docker-compose up --build
```

# TODO

- [ ] Support for logical constraint translation.
- [ ] Ability to parse custom profiles.
- [ ] Support for multiple inputs (for example, a logical constraint is referenced by its URI in another graph).
