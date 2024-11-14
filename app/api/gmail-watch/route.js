// app/api/gmail-watch/route.js
import { google } from 'googleapis';
import { authOptions } from '../auth/[...nextauth]/route';
import { getServerSession } from "next-auth/next";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const response = await gmail.users.watch({
      userId: 'me',
      requestBody: {
        topicName: 'projects/gmail-downloader-435403/topics/gmail-notifications',
        labelIds: ['INBOX'],
      },
    });
    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error setting up Gmail watch:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
