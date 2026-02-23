const {
  ApiError,
  ChatApi,
  ChatPostMessageErrorSchemaError,
  Client,
  Environment,
  LogLevel,
  OauthScope,
} = require('slack-apimatic-sdk-sdk');

const isEnabled = () => {
  return String(process.env.SLACK_NOTIFICATIONS_ENABLED || '').toLowerCase() === 'true';
};

const getClient = () => {
  const {
    SLACK_OAUTH_CLIENT_ID,
    SLACK_OAUTH_CLIENT_SECRET,
    SLACK_OAUTH_REDIRECT_URI,
  } = process.env;

  if (!SLACK_OAUTH_CLIENT_ID || !SLACK_OAUTH_CLIENT_SECRET || !SLACK_OAUTH_REDIRECT_URI) {
    throw new Error(
      'Missing Slack OAuth env vars: SLACK_OAUTH_CLIENT_ID, SLACK_OAUTH_CLIENT_SECRET, SLACK_OAUTH_REDIRECT_URI'
    );
  }

  return new Client({
    authorizationCodeAuthCredentials: {
      oauthClientId: SLACK_OAUTH_CLIENT_ID,
      oauthClientSecret: SLACK_OAUTH_CLIENT_SECRET,
      oauthRedirectUri: SLACK_OAUTH_REDIRECT_URI,
      oauthScopes: [OauthScope.Chatwritebot, OauthScope.Chatwriteuser],
    },
    timeout: 30000,
    environment: Environment.Production,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: { logBody: true },
      logResponse: { logHeaders: true },
    },
  });
};

const buildTaskText = ({ action, task }) => {
  const status = task?.completed ? '✅ completed' : '🟡 pending';
  const title = task?.title ? `*${task.title}*` : '*Untitled task*';
  const description = task?.description ? ` — ${task.description}` : '';
  const id = task?._id ? ` (id: ${task._id})` : '';
  return `Task ${action}: ${title}${description}${id} | ${status}`;
};

const notifyTaskEvent = async ({ action, task }) => {
  if (!isEnabled()) return { skipped: true };

  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL_ID;

  if (!token || !channel) {
    return { skipped: true, reason: 'Missing SLACK_BOT_TOKEN or SLACK_CHANNEL_ID' };
  }

  try {
    const client = getClient();
    const chatApi = new ChatApi(client);
    const text = buildTaskText({ action, task });

    const response = await chatApi.chatPostMessage(
      token,
      channel,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      text
    );

    return { skipped: false, ok: true, result: response.result };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error instanceof ChatPostMessageErrorSchemaError) {
        return { skipped: false, ok: false, error: error.result };
      }
      return { skipped: false, ok: false, error: error.body };
    }
    return { skipped: false, ok: false, error: error.message };
  }
};

module.exports = { notifyTaskEvent };
