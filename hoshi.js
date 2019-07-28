require('./src/util/Extensions');

const HoshiClient = require('./src/struct/HoshiClient');
const Logger = require('./src/util/Logger');
const Sentry = require('@sentry/node');
let config;
try {
	config = require('./config.json');
} catch (err) {
	Logger.warn('./config.json doesn\'t exist, trying environment variables...');
	config = {
		"token": process.env.HOSHI_TOKEN,
		"owner": process.env.HOSHI_OWNER_IDS.split(','), //"123992700587343872,86890631690977280"
		"dbURL": process.env.HOSHI_DB_URL,
		"sentryKey": process.env.HOSHI_SENTRY_KEY,
		"selfstarWarningTimeout": (process.env.HOSHI_SELF_STAR_WARNING_TIMEOUT === undefined) ? 60000 : process.env.HOSHI_SELF_STAR_WARNING_TIMEOUT
	}
}
const client = new HoshiClient(config);

if (config.sentryKey) {
	Sentry.init({ dsn: config.sentryKey });
}

client.on('disconnect', () => Logger.warn('Connection lost...'))
	.on('reconnect', () => Logger.info('Attempting to reconnect...'))
	.on('error', err => Logger.error(err))
	.on('warn', info => Logger.warn(info));

client.start();

process.on('unhandledRejection', err => {
	Logger.error('An unhandled promise rejection occured');
	Logger.stacktrace(err);
});
