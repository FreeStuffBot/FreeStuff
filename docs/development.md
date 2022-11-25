
# Development Environment

## Required Software

The following software has to be installed on your system.

- [Node.js](https://nodejs.org/) 16.x or later.
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or normal Docker if you know what you're doing).
- [MongoDB Compass](https://www.mongodb.com/products/compass) (or the cli if you know what you're doing).

## Other Requirements

- Have a Discord account.
    - You'll use it to create a Discord application.
    - And to login into the freestuff dashboard.

## Instructions

### Setting up the Discord Application

1. Open the [Discord Developer Portal](https://discord.com/developers/applications) on the Applications section.
2. Create a new application.
    - You can name it whatever you want.
    - You can set it's icon whatever you want.
3. From the "General Information" page get the: **Application ID** and **Public Key**.
4. From the "OAuth" > "General" page get the **Client Secret**.
    - Click "Reset Secret" and confirm it.
    - Copy the generated code, you'll only be able to see it once.
5. In the same page add the following redirect:
    - Click "Add Redirect".
    - Fill in `http://localhost:5522/oauth/callback/discord`.
    - Click "Save Changes".
6. Store those 3 values somewhere safe (like a text file), you'll need them when configuring the services.

### Building the freestuff services

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

### Configuring the freestuff services

1. Within the clone repository, navigate to `packages/config`.
2. Copy `docker-template.dev-config.js` to `dev-config.js`.
3. Open `dev-config.js` in a code editor.
4. Replace the values in the `Discord Tokens` section with the tokens you obtained earlier (in the Docker application section of this doc).

### Starting the freestuff api service

1. Open a terminal in the cloned repository.
2. Start the supporting docker services.

```sh
docker compose up -d
```

3. Wait about 30-90 seconds for the MongoDB instance to get initialized.
    - You can inspect the containers log to check whether they're ready or not.
4. Change the working directory to `apps/api` (run `cd ./apps/api`).
5. Run `yarn dev` to start the api service.

### Running the Dashboard

1. Clone the [dashboard repository](https://github.com/FreeStuffBot/dashboard) locally.
2. Open a terminal in the repository.
3. Install the dashboard's dependencies through Yarn.

```sh
yarn
```

4. Run the dashboard through.

```sh
yarn dev
```

5. Open the dashboard though **this** url: http://localhost:5522/?API_HOST=http://localhost:5001/
    - It's necessary so that the api url is configured properly.
    - Once it's used once you can access it normally through http://localhost:5522/.
    - When logging out you'll have to use the special url again.

6. Login through your discord account.

### Acquiring admin privileges

1. Make sure you logged in once with your discord account.
2. Open MongoDB Compass.
3. Connect using the following URI

```
mongodb://freestuff-dev:freestuff-dev@127.0.0.1:27017/freestuffbot?authSource=admin
```

4. Navigate to the `freestuffbot` database, the `users` collection.
5. Switch to the json view mode.
6. Find your account (there should be only one so you don't have to search around).
7. Edit the JSON object.
8. Add `"admin"` to the `scopes` field array.

![mongodb compass](./assets/MongoDBCompass_lLwxlysKoc.png)

9. You're good to go!

### Epilogue

That's it, whenever you want to run a freestuff service, make sure that you have the Docker services running in the background.

## How to

### Start the docker services in background

```sh
docker compose up -d
```

### Stop the docker services

```sh
docker compose down
```

### Start a freestuff service

```sh
cd apps/<the-service-you-want>
yarn dev
```

### Reinitialize the database

You can do so by bringing down all the services and deleting their docker volumes. Then starting them again so that the initialization scripts run.

```sh
docker compose down -v
docker compose up -d
```
