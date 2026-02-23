const DEFAULT_BASE_URL = 'https://slack.com/api';

const isEnabled = () => {
  return String(process.env.SLACK_NOTIFICATIONS_ENABLED || '').toLowerCase() === 'true';
};

const buildTaskText = ({ action, task }) => {
  const status = task?.completed ? '✅ completed' : '🟡 pending';
  const title = task?.title ? `*${task.title}*` : '*Untitled task*';
  const description = task?.description ? ` — ${task.description}` : '';
  const id = task?._id ? ` (id: ${task._id})` : '';
  return `Task ${action}: ${title}${description}${id} | ${status}`;
};

const postMessage = async (text) => {
  if (!isEnabled()) return { skipped: true };

  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL_ID;

  if (!token || !channel) {
    return { skipped: true, reason: 'Missing SLACK_BOT_TOKEN or SLACK_CHANNEL_ID' };
  }

  const baseUrl = process.env.SLACK_BASE_URL || DEFAULT_BASE_URL;
  const response = await fetch(`${baseUrl}/chat.postMessage`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel, text }),
  });

  const data = await response.json();
  if (!data.ok) {
    return { skipped: false, ok: false, error: data.error || 'unknown_error' };
  }

  return { skipped: false, ok: true, ts: data.ts };
};

const notifyTaskEvent = async ({ action, task }) => {
  try {
    const text = buildTaskText({ action, task });
    return await postMessage(text);
  } catch (error) {
    return { skipped: false, ok: false, error: error.message };
  }
};

module.exports = { notifyTaskEvent };
