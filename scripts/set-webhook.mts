export {};

const token = process.env.TELEGRAM_BOT_TOKEN;
const url = `${process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL}/api/telegram`;
const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ url, secret_token: process.env.TELEGRAM_WEBHOOK_SECRET, allowed_updates: ['message'], drop_pending_updates: true }),
});
console.log(url, await res.json());
