const { ChatApi, Client, Environment } = require('slack-apimatic-sdk-sdk');
require('dotenv').config();

const slackBotToken = process.env.SLACK_BOT_TOKEN || '';
const slackChannelId = process.env.SLACK_CHANNEL_ID || '';

let chatApi = null;

if (!slackBotToken) {
    console.warn('Slack notifications disabled: SLACK_BOT_TOKEN is missing.');
}
if (!slackChannelId) {
    console.warn('Slack notifications disabled: SLACK_CHANNEL_ID is missing.');
}

if (slackBotToken && slackChannelId) {
    const client = new Client({
        environment: Environment.Production,
        authorizationCodeAuthCredentials: {
            oauthToken: {
                accessToken: slackBotToken,
                tokenType: 'Bearer',
            },
        },
    });

    chatApi = new ChatApi(client);
}

const sendSlackNotification = async (message) => {
    if (!chatApi || !slackBotToken || !slackChannelId) {
        return;
    }

    try {
        await chatApi.chatPostMessage(
            slackBotToken,
            slackChannelId,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            message,
            undefined,
            undefined,
            undefined,
            undefined
        );
    } catch (error) {
        const slackError = error?.result || error?.message || 'Unknown Slack error';
        console.error('Failed to send Slack notification:', slackError);
    }
};

const notifyTaskCreated = async (task) => {
    const descriptionLine = task.description ? `• Description: ${task.description}` : '';
    const message = `🆕 *New Task Created*\n• Title: *${task.title}*\n${descriptionLine}\n• Task ID: ${task._id}`;
    await sendSlackNotification(message.trim());
};

module.exports = { sendSlackNotification, notifyTaskCreated };
