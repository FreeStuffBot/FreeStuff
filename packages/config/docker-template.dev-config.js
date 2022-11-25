
/* -- Discord Tokens -- */
const DISCORD_CLIENT_ID = '<place-your-client-id-here>';
const DISCORD_PUBLIC_KEY = '<place-your-public-key-here>';
const DISCORD_OAUTH_CLIENT_SECRET = '<place-your-client-secret-here>';

/* -- Local Services -- */
const MONGO_URL = 'mongodb://freestuff-dev:freestuff-dev@127.0.0.1:27017/freestuffbot?authSource=admin';
const RABBIT_URL = 'amqp://freestuff-dev:freestuff-dev@localhost';
const REDIS_URL = 'redis://localhost:6379';

const DASHBOARD_PORT = 5522;

/* -- Microservices Ports -- */
const API_PORT = 5001;
const THUMBNAILER_PORT = 5051;
const DISCORD_GATEWAY_PORT = 5053;
const LINK_PROXY_PORT = 5062;
const MANAGER_PORT = 5055;

const DISCORD_INTERACTIONS_PORT = 5058;
const TELEGRAM_PUBLISHER_PORT = 5047;

module.exports = {
  host: 'http://localhost',
  env: {
    DOCKER_OFFLINE_MODE: 'true',

    NETWORK_DISCORD_GATEWAY: `http://localhost:${DISCORD_GATEWAY_PORT}`,
    NETWORK_THUMBNAILER: `http://localhost:${THUMBNAILER_PORT}`,
    NETWORK_LINK_PROXY: `http://localhost:${LINK_PROXY_PORT}`,
    NETWORK_MANAGER: `http://localhost:${MANAGER_PORT}`,
    NETWORK_GIBU_GQL_ENDPOINT: 'http://localhost:3030/graphql',
    
    // NETWORK_UMI_ALLOWED_IP_RANGE: '10.0.0.0/8', // <- this is the docker range we wanna use in production
    NETWORK_UMI_ALLOWED_IP_RANGE: '',

    DATABASE_GATEWAY_PORT: 5057,

    /* -- 'thumbnailer' microserivce -- */
    THUMBNAILER_PORT,
    THUMBNAILER_DISCORD_TOKEN: 'awdawdawdawdawdawdawd', // preferably the freestuff manager token
    THUMBNAILER_DISCORD_CDN_CHANNEL: '0',

    /* -- 'docker-interactions' microservice -- */
    DISCORD_INTERACTIONS_PORT,
    DISCORD_INTERACTIONS_CLIENTID: DISCORD_CLIENT_ID,
    DISCORD_INTERACTIONS_PUBKEY: DISCORD_PUBLIC_KEY,
    DISCORD_INTERACTIONS_MONGO_URL: MONGO_URL,
    DISCORD_INTERACTIONS_RABBIT_URL: RABBIT_URL,
    DISCORD_INTERACTIONS_FREESTUFF_API_URL: `http://localhost:${API_PORT}`,
    DISCORD_INTERACTIONS_FREESTUFF_API_KEY: 'verysecret',

    /* -- 'docker-gateway' microservice -- */
    DISCORD_GATEWAY_PORT,
    DISCORD_GATEWAY_API_TOKEN: 'awdawdawdawdawd',
    DISCORD_GATEWAY_API_USER: DISCORD_CLIENT_ID,

    /* -- 'docker-publisher' microservice -- */
    DISCORD_PUBLISHER_MONGO_URL: MONGO_URL,
    DISCORD_PUBLISHER_RABBIT_URL: RABBIT_URL,
    DISCORD_PUBLISHER_FREESTUFF_API_URL: `http://localhost:${API_PORT}`,
    DISCORD_PUBLISHER_FREESTUFF_API_KEY: 'verysecret',

    /* -- 'api' microservice -- */
    API_PORT,
    API_OAUTH_DISCORD_APPID: DISCORD_CLIENT_ID,
    API_OAUTH_DISCORD_APPSECRET: DISCORD_OAUTH_CLIENT_SECRET,
    API_PRIVATE_KEY_URI: './vault/serverauth-private.key',
    API_MONGO_URL: MONGO_URL,
    API_REDIS_URL: REDIS_URL,
    API_RABBIT_URL: RABBIT_URL,
    API_DASH_CORS_ORIGIN: `http://localhost:${DASHBOARD_PORT}`,
    API_DASH_OAUTH_CALLBACK_URL: `http://localhost:${DASHBOARD_PORT}/oauth/callback`,
    API_AUDITLOG_DEST_DISCORD: '',

    /* -- 'link-proxy' microservice --  */
    LINK_PROXY_PORT,
    LINK_PROXY_FIREBASE_API_KEY: '',
    LINK_PROXY_FIREBASE_SERVICE_ACCOUNT_KEY: ``,
    LINK_PROXY_MONGO_URL: MONGO_URL,

    /* -- 'manager' microservice -- */
    MANAGER_PORT,
    MANAGER_MONGO_URL: MONGO_URL,
 
    /* -- 'app-publisher' microservice -- */
    APP_PUBLISHER_MONGO_URL: MONGO_URL,
    APP_PUBLISHER_RABBIT_URL: RABBIT_URL,
    APP_PUBLISHER_FREESTUFF_API_URL: `http://localhost:${API_PORT}`,
    APP_PUBLISHER_FREESTUFF_API_KEY: 'verysecret',
    APP_PUBLISHER_UPSTREAM_URL: '',
    APP_PUBLISHER_UPSTREAM_AUTH: '',

    /* -- 'telegram-publisher' microservice -- */
    TELEGRAM_PUBLISHER_PORT,
    TELEGRAM_PUBLISHER_RABBIT_URL: RABBIT_URL,
    TELEGRAM_PUBLISHER_FREESTUFF_API_URL: `http://localhost:${API_PORT}`,
    TELEGRAM_PUBLISHER_FREESTUFF_API_KEY: 'verysecret'
  }
}
