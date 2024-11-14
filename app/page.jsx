"use client";

import { useSession, signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

import { useRouter } from 'next/navigation'
import Link from 'next/link';

import {LoginURL} from './api/config/config';


const arrayToUint8Array = (array)=> {
  const len = array.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = array[i];
  }
  return bytes;
};


export default function Home() {
  const { data: session } = useSession();
  const [maildata, setMaildata] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [avatar, setAvatar] = useState(null);


  const router = useRouter();





  const fetchAvatar = async () => {
    if(session){
        console.log(session)
      try {       
        await axios.get('/api/avatar', {
          params: {
            accessToken: session.accessToken           
          },
        })
        .then((res) => { 
          setAvatar(res.data.avatarUrl);      
        })
        .catch( e => {
          console.log(e)
        })



      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    }
  }

  const fetchThread = async (pageToken = null) => {
    if (session) {
      setIsLoading(true);
      try {
   
        const res = await axios.get('/api/gmail', {
          params: { 
            accessToken: session.accessToken,
            pageToken: pageToken,
            maxResults: 4,
            labelIds: 'INBOX' // INBOX, DRAFT, SPAM
          },
        });

        console.log(res.data.threads)

        setMaildata((prevAttachments) => [
          ...prevAttachments,
          ...res.data.threads
        ]);

        setNextPageToken(res.data.nextPageToken || null);      
      } catch (error) {
        console.error('Error fetching attachments:', error);
      } finally {
        setIsLoading(false);        
      }
    }
  };

  const getMimeType = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';  
    }
  };

  const handleDownload = (attachment) => {
    try {
      const base64String = attachment.data.data;
      const binaryString = Buffer.from(base64String, 'base64');
      const bytes = arrayToUint8Array(binaryString);

      const mimeType = getMimeType(attachment.filename);
      const blob = new Blob([bytes], { type: mimeType });

      // console.log(blob)

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = attachment.filename;
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error("Failed to download attachment:", e);
    }
  };


  useEffect(() => {
    if (session && !hasFetchedData) {
      fetchAvatar();
      fetchThread();
      setHasFetchedData(true);
    }

  }, [session, hasFetchedData]);



  if(!session){
    return (
      <button onClick={() => signIn()}>Sign in with Google</button>
    )
  }
  else{
        router.push('/dashboard')

  }

  


  return (
    <div>
      <h1>Gmail Downloader</h1>

      <Link href="/dashboard">Dashboard</Link>
      <br/>

      <div>
        {session.accessToken}
      </div>

      <button onClick={() => signOut()}>Sign out</button>
      {
        avatar && <img src={avatar} alt="Avatar" />
      }
      {maildata.map((data, index) => {
        return (
          <div key={index}>
            <p>-------------------------------------------------------------</p>
            <h2>From: {data.from}</h2>
            <h4>Subject: {data.subject}</h4>
            <h4>Date: {data.date}</h4>          
            <div dangerouslySetInnerHTML={{ __html: data.content }}> 
        
            </div>
            <div>
              Attachment: {data.attachment ? data.attachment.filename : 'No attachment'}
            </div>
            {data.attachment && (
              <button onClick={() => handleDownload(data.attachment)}>
                Download
              </button>
            )}
          </div>
        );
      })}
      {nextPageToken && !isLoading && (
        <button onClick={() => fetchThread(nextPageToken)}>
          Load More
        </button>
      )}
      {isLoading && <p>Loading...</p>}
    </div>
  );

}
