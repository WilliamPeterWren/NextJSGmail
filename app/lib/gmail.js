// app/lib/gmail.js
export async function watchGmail(accessToken) {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/watch', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topicName: 'projects/gmail-downloader-435403/topics/gmail-notifications', // Replace with your topic
      labelIds: ['INBOX'],
    }),
  });
  
  if (!res.ok) {
    throw new Error('Failed to set up Gmail watch');
  }
  
  return await res.json();
}
