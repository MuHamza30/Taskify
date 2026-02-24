const { WebClient } = require('@slack/web-api');
require('dotenv').config();

const slackBotToken = process.env.SLACK_BOT_TOKEN || '';
const slackChannelId = process.env.SLACK_CHANNEL_ID || '';
let slackClient = null;

if (slackBotToken && slackChannelId) {
    slackClient = new WebClient(slackBotToken);
} else {
    console.warn('Slack notifications disabled: SLACK_BOT_TOKEN and/or SLACK_CHANNEL_ID are not configured.');
}

const sendSlackNotification = async (message) => {
    if (!slackClient) {
        return;
    }

    try {
        await slackClient.chat.postMessage({
            channel: slackChannelId,
            text: message,
            mrkdwn: true,
        });
    } catch (error) {
        const slackError = error.data?.error || error.message;
        console.error('Failed to send Slack notification:', slackError);
    }
};

module.exports = { sendSlackNotification };
