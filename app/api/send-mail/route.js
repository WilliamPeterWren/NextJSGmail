import { google } from 'googleapis';

export async function POST(req) {
  const { to, replyText, accessToken, fromName, fromEmail, subject, files } = await req.json();

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth });

  let rawMessage = [
    `From: =?UTF-8?B?${Buffer.from(fromName).toString('base64')}?= <${fromEmail}>`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="boundary"`,
    ``,
    `--boundary`,
    `Content-Type: text/plain; charset=UTF-8`,
    ``,
    replyText,
  ].join('\n');


  if(files.length > 0){
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
  

  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const requestBody = {
    raw: encodedMessage,  
    labelIds: ['INBOX', 'SENT'], 
  };

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: requestBody,
    });

    console.log(res);

    return new Response(JSON.stringify({ status: 'Email sent successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending email:', error); 
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
