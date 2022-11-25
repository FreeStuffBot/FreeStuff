
# Development Environment

## Required Software

The following software has to be installed on your system.

- [Node.js](https://nodejs.org/) 16.x or later.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or normal Docker if you know what you're doing).

## Optional Recommended Software

Which could be helpful in the development process.

- [MongoDB Compass](https://www.mongodb.com/products/compass).

## Instructions

1. Clone the repository locally on your system.
2. Enable Yarn through `corepack`, which ships with Node 16.x and up.

```sh
# Use an elevated shell (Administrator shell on Windows, sudo on Unix-like).
corepack enable
```

3. Install the project's dependencies through Yarn.

```sh
yarn
```

4. Build the project.

```sh
yarn build
```

5. Start the supporting docker services.

```sh
docker compose up -d
```

## Troubleshooting

### Reinitialize the database

You can do so by bringing down all the services and deleting their docker volumes. Then starting them again so that the initialization scripts run.

```sh
docker compose down -v
docker compose up -d
```
