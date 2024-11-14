import { google } from 'googleapis';

export async function POST(req) {
  const { 
    subject, 
    // forwardText, 
    to, 
    fromName, 
    fromEmail, 
    accessToken, 
    files, 
    originalMessageContent, 
  } = await req.json();

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth });


  let rawMessage = [
    `From: =?UTF-8?B?${Buffer.from(fromName).toString('base64')}?= <${fromEmail}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from("Fwd: " + subject).toString('base64')}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="boundary"`,
    ``,
    `--boundary`,
    `Content-Type: text/plain; charset=UTF-8`,
    // ``,
    // forwardText, 
    ``,
    originalMessageContent,
    ].join('\n');



  if (files && files.length > 0) {
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
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return new Response(JSON.stringify({ status: 'Email forwarded successfully' }), {
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
