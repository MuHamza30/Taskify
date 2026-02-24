const { IncomingWebhook } = require('@slack/webhook');
require('dotenv').config();

const webhookUrl = process.env.SLACK_WEBHOOK_URL || '';
let webhookClient = null;

if (webhookUrl) {
    webhookClient = new IncomingWebhook(webhookUrl);
} else {
    console.warn('SLACK_WEBHOOK_URL is not configured. Slack notifications are disabled.');
}

const sendSlackNotification = async (message) => {
    if (!webhookClient) {
        return;
    }

    try {
        await webhookClient.send({
            text: message,
        });
    } catch (error) {
        console.error('Failed to send Slack notification:', error.message);
    }
};

module.exports = { sendSlackNotification };
