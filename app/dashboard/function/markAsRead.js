export default async function markThreadAsRead(threadId, accessToken) {
  try {
    const response = await fetch('/api/mark-as-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threadId, accessToken }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('Email marked as read successfully');
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Error calling mark-as-read API:', error);
  }
}