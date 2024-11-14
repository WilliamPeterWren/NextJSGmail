import { google } from 'googleapis';

export async function POST(req) {
  const { 
    subject, 
    replyText, 
    to, 
    Cc, 
    inReplyTo, 
    fromName, 
    fromEmail, 
    threadId, 
    accessToken, 
    files, 
    references 
  } = await req.json();

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  let rawMessage = [
    `From: =?UTF-8?B?${Buffer.from(fromName).toString('base64')}?= <${fromEmail}>`,
    `To: ${to}`,  // Directly use the 'to' email without encoding
    // Uncomment and properly format Cc if required
    // `Cc: =?UTF-8?B?${Buffer.from(Cc).join(', ').toString('base64')}?=`,
    `In-Reply-To: ${inReplyTo}`,
    `Subject: =?UTF-8?B?${Buffer.from("Re: " + subject).toString('base64')}?=`,
    `References: ${references}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="boundary"`,
    ``,
    `--boundary`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    replyText,
  ].join('\n');

  if (files.length > 0) {
    files.forEach(file => {
      rawMessage += [
        `\n--boundary`,
        `Content-Type: ${file.type}; name="${file.name}"`,
        `Content-Disposition: attachment; filename="${file.name}"`,
        `Content-Transfer-Encoding: base64`,
        ``,
        file.data,
      ].join('\n');
    });

    rawMessage += `\n--boundary--`;
  }

  const encodedMessage = Buffer.from(rawMessage).toString('base64');

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',   
      requestBody: {
        raw: encodedMessage,
        threadId: threadId, 
      },
    })  

    // console.log(res);

    if(res.status === 200) {
      return new Response(JSON.stringify({ status: 'Reply sent successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ status: 'Reply Error' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
