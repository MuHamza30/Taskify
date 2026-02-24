const {
  ApiError,
  ChatApi,
  ChatPostMessageErrorSchemaError,
  Client,
  Environment,
  LogLevel,
  OauthScope,
} = require('slack-apimatic-sdk-sdk');

let chatApiInstance;

const buildAuthCredentials = () => {
  const botToken = process.env.SLACK_BOT_TOKEN;

  if (!botToken) {
    return null;
  }

  return {
    oauthClientId: process.env.SLACK_CLIENT_ID || '',
    oauthClientSecret: process.env.SLACK_CLIENT_SECRET || '',
    oauthRedirectUri: process.env.SLACK_REDIRECT_URI || '',
    oauthScopes: [OauthScope.Chatwritebot, OauthScope.Chatwriteuser],
    oauthToken: {
      accessToken: botToken,
    },
  };
};

const getChatApi = () => {
  if (chatApiInstance) {
    return chatApiInstance;
  }

  const authCredentials = buildAuthCredentials();

  if (!authCredentials) {
    return null;
  }

  const client = new Client({
    authorizationCodeAuthCredentials: authCredentials,
    environment: Environment.Production,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: {
        logBody: false,
      },
      logResponse: {
        logHeaders: true,
      },
    },
  });

  chatApiInstance = new ChatApi(client);
  return chatApiInstance;
};

const buildBlocksPayload = (task) => {
  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: 'New task created 🆕',
        emoji: true,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${task.title}*${task.description ? `\n${task.description}` : ''}`,
      },
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Task ID: ${task._id?.toString?.() || task.id || 'n/a'}`,
        },
        {
          type: 'mrkdwn',
          text: `Status: ${task.completed ? '✅ Completed' : '⏳ Pending'}`,
        },
      ],
    },
  ];

  return JSON.stringify(blocks);
};

const sendTaskCreatedNotification = async (task) => {
  const botToken = process.env.SLACK_BOT_TOKEN;
  const channelId = process.env.SLACK_CHANNEL_ID;

  if (!botToken || !channelId) {
    console.warn('[slack] Missing SLACK_BOT_TOKEN or SLACK_CHANNEL_ID. Skipping notification.');
    return {
      success: false,
      reason: 'missing_credentials',
    };
  }

  const chatApi = getChatApi();

  if (!chatApi) {
    console.warn('[slack] Unable to initialize Slack client.');
    return {
      success: false,
      reason: 'client_init_failed',
    };
  }

  const summaryText = task.description
    ? `New task created: ${task.title} — ${task.description}`
    : `New task created: ${task.title}`;
  const blocks = buildBlocksPayload(task);

  try {
    const response = await chatApi.chatPostMessage(
      botToken,
      channelId,
      undefined,
      undefined,
      blocks,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      summaryText,
      undefined,
      undefined,
      undefined,
      undefined,
    );

    const result = response.result || {};

    return {
      success: true,
      channel: result.channel || channelId,
      ts: result.ts,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('[slack] API error status:', error.statusCode);
      console.error('[slack] API error body:', error.body);

      if (error instanceof ChatPostMessageErrorSchemaError) {
        console.error('[slack] chat.postMessage error result:', error.result);
      }
    } else {
      console.error('[slack] Unexpected error:', error);
    }

    return {
      success: false,
      reason: 'slack_api_error',
      details: error.message,
    };
  }
};

module.exports = {
  sendTaskCreatedNotification,
};
