// app/api/gmail-webhook/route.js

import { getSocketServer } from '../../lib/socketServer';

export async function POST(req) {
  const io = getSocketServer();

  const message = await req.json();

  if (message && message.data) {
    const decodedMessage = JSON.parse(
      Buffer.from(message.data, 'base64').toString('utf-8')
    );

    console.log('Received Gmail notification:', decodedMessage);

    io?.emit('new-email', decodedMessage);

    return new Response(JSON.stringify(decodedMessage), { status: 200 });
  } else {
    return new Response(JSON.stringify({ error: 'Invalid data' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
