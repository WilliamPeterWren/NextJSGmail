// app/api/avatar/route.js

import { google } from 'googleapis';
import { getServerSession } from "next-auth/next"
import { authOptions }  from '../auth/[...nextauth]/route'; 

export async function GET(req) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return await new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { searchParams } = new URL(req.url);
  const accessToken = searchParams.get('accessToken');

  if (!accessToken) {
    return new Response(JSON.stringify({ error: 'Missing access token' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  const peopleService = google.people({ version: 'v1', auth });

  try {
    const profileRes = await peopleService.people.get({
      resourceName: 'people/me',
      personFields: 'photos',
    });
    
    const avatarUrl = profileRes.data?.photos[0]?.url || null;

    const connectionsRes = await peopleService.people.connections.list({
      resourceName: 'people/me',
      pageSize: 10, 
      personFields: 'names,photos,emailAddresses', 
    });

    const connections = connectionsRes.data.connections || [];

    return new Response(JSON.stringify({ avatarUrl, connections }), {
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
