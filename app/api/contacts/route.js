import { google } from 'googleapis';

const fetchContacts = async (accessToken) => {
  const peopleService = google.people({
    version: 'v1',
    auth: new google.auth.OAuth2().setCredentials({ access_token: accessToken }),
  });

  try {
    const response = await peopleService.people.connections.list({
      resourceName: 'people/me',
      pageSize: 10, 
      personFields: 'names,emailAddresses', 
    });

    const contacts = response.data.connections || [];
    return contacts.map(contact => ({
      name: contact.names[0]?.displayName,
      email: contact.emailAddresses[0]?.value,
    }));
  } catch (error) {
    console.error('Error fetching contacts:', error);
    throw error;
  }
};

// Usage example
const accessToken = 'YOUR_ACCESS_TOKEN'; // Replace with your access token
fetchContacts(accessToken).then(contacts => {
  console.log('Fetched Contacts:', contacts);
}).catch(error => {
  console.error('Failed to fetch contacts:', error);
});
