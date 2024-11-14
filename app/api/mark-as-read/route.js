// app/api/gmail/mark-as-read/route.js
import { google } from 'googleapis';
import { NextResponse } from 'next/server';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

async function setAccessToken(token) {
  oauth2Client.setCredentials({ access_token: token });
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function POST(request) {
  const { threadId, accessToken } = await request.json();

  if (!threadId || !accessToken) {
    return NextResponse.json({ error: 'Email ID and Access Token are required' }, { status: 400 });
  }

  try {
    const gmail = await setAccessToken(accessToken);

    await gmail.users.threads.modify({
      userId: 'me',
      id: threadId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking email as read:', error);
    return NextResponse.json({ error: 'Failed to mark email as read' }, { status: 500 });
  }
}
