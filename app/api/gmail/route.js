import { google } from 'googleapis';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const accessToken = url.searchParams.get('accessToken');
  const pageToken = url.searchParams.get('pageToken');
  const maxResults = url.searchParams.get('maxResults') || 10;
  const labelIds = url.searchParams.get('labelIds');

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = await google.gmail({ version: 'v1', auth });

  try {
    if(labelIds === 'SENT'){
      // console.log(threads);
      console.log("pt: "+pageToken);
    }


    const threadsRes = await gmail.users.threads.list({
      userId: 'me',
      maxResults: Math.min(parseInt(maxResults, 10), 100),
      labelIds: labelIds,
      pageToken: pageToken || undefined,
    });

    const threads = threadsRes.data.threads || [];
    const nextPageToken = threadsRes.data.nextPageToken;

    
    const threadData = await Promise.all(
      threads.map(async (thread) => {
        try {
          const threadRes = await gmail.users.threads.get({ userId: 'me', id: thread.id });
          const threadMessages = threadRes.data.messages || [];
     
          const latestMessage = threadMessages[threadMessages.length - 1];
          const headers = latestMessage.payload.headers;
          const subject = headers.find((item) => item.name === 'Subject')?.value || '(No Subject)';
          const from = headers.find((item) => item.name === 'From')?.value;
          const date = headers.find((item) => item.name === 'Date')?.value;     
          const isRead = !(latestMessage.labelIds || []).includes('UNREAD');

          return {
            threadId: thread.id,
            from,
            subject,
            date,         
            isRead,
            // messages: threadMessages.map((msg) => ({
            //   id: msg.id,
            //   snippet: msg.snippet,
            //   labelIds: msg.labelIds,
            // })),
          };

        } catch (err) {
          console.error(`Error fetching thread: ${thread.id}`, err);
          return null;
        }
      })
    );

    return new Response(JSON.stringify({ threads: threadData.filter(Boolean), nextPageToken }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
