export async function watchGmail() {
  try {
    const response = await fetch('/api/gmail-watch', {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to set up Gmail watch');
    }
    const data = await response.json();
    // console.log('Gmail watch setup successful:', data);
  } catch (error) {
    console.error('Error setting up Gmail watch:', error);
  }
}