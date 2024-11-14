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
  const threadId = url.searchParams.get('threadId');

  if (!threadId) {
    return new Response(JSON.stringify({ error: 'threadId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  try {
    const threadRes = await gmail.users.threads.get({
      userId: 'me',
      id: threadId,
    });

    const threadMessages = threadRes.data.messages || [];

    const threadData = await Promise.all(threadMessages.map(async (threadMessage) => {
      const threadMsg = await gmail.users.messages.get({
        userId: 'me',
        id: threadMessage.id,
      });
      
      const threadHeaders = threadMsg.data.payload.headers;
      
      const messageId = threadHeaders.find(item => item.name === 'Message-ID')?.value || null;      
      const inReplyTo = threadHeaders.find((item) => item.name === 'In-Reply-To')?.value || null;      
      const references = threadHeaders.find((item) => item.name === 'References')?.value || null;      
      const Cc = threadHeaders.find(item => item.name === 'Cc')?.value || null;
      const listTo = threadHeaders.find(item => item.name === 'To')?.value;
      const to = listTo.split(',');
      const from = threadHeaders.find(item => item.name === 'From')?.value;
      const date = threadHeaders.find(item => item.name === 'Date')?.value;
      const subject = threadHeaders.find(item => item.name === 'Subject')?.value || "No Subject";

      let content = threadMsg.data.snippet;

      let contentHtml = null;
      if (threadMsg.data.payload.body.data) {
        const contentBase64 = threadMsg.data.payload.body.data;
        contentHtml = Buffer.from(contentBase64, 'base64').toString('utf-8');
      }

      const attachments = [];
      const attachments2 = [];
      if (threadMsg.data.payload?.parts) {

        const threadParts = threadMsg.data.payload.parts;      
        for (const part of threadParts) {
          console.log(part);

          if (part.filename && part.body.attachmentId) { 
            // const attachment = await gmail.users.messages.attachments.get({
            //   userId: 'me',
            //   messageId: threadMessage.id,
            //   id: part.body.attachmentId,
            // });
            attachments.push({
              filename: part.filename,
              // data: attachment.data,
              id: part.body.attachmentId,
            });
          }
          else if(part.body?.data) {
            const contentBase64 = part.body.data;       
            const buffer = Buffer.from(contentBase64, 'base64').toString('utf-8');        
            attachments2.push(buffer);
          }
        }

        if(threadParts?.[1]?.body?.data){
          const contentBase64 = threadParts[1]?.body?.data;
          if(contentBase64){
            contentHtml = Buffer.from(contentBase64, 'base64').toString('utf-8');                        
          }
        }
        else if (threadParts[0].parts?.[1]?.body?.data) {
          const contentBase64 = threadParts[0].parts[1]?.body?.data;            
          if (contentBase64) {
            contentHtml = Buffer.from(contentBase64, 'base64').toString('utf-8');                  
          }
        }

      }

   

      return {
        content,
        contentHtml, 
        attachments,
        attachments2,
        subject,
        from,
        date,
        to, 
        Cc,
        messageId,
        inReplyTo,
        references,
      };
    }));

    return new Response(JSON.stringify({threadId, thread: threadData }), {
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
