// app/dashboard/page.js

"use client";

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const getUsername = (email) => {
  const displayNameMatch = email.match(/"([^"]+)"|([^<]+) <[^>]+>/);
  return displayNameMatch ? displayNameMatch[1] || displayNameMatch[2].trim() : null;
};

const getEmail = (email) => {
  const emailMatch = email.match(/<([^>]+)>/);
  return emailMatch ? emailMatch[1] : email;
};

const getUsernameOrEmail = (email) => {
  const displayNameMatch = email.match(/"([^"]+)"|([^<]+) <[^>]+>/);
  return displayNameMatch ? displayNameMatch[1] || displayNameMatch[2].trim() : email;
};

export default function DashboardPage()  {
  const { data: session } = useSession();
  const [maildata, setMaildata] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [downloaded, setDownloaded] = useState([]);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const fetchAttachments = async (pageToken = null) => {
    if (session) {
      setIsLoading(true);
      try {
      
        const res = await axios.get('/api/contacts', {
          params: { 
            accessToken: session.accessToken,
            pageToken: pageToken,
            maxResults: 10,
            labelIds: 'IMPORTANT',
          
          },
        });

        console.log(res.data.messages)

        setMaildata((prevAttachments) => [
          ...prevAttachments,
          ...res.data.messages
        ]);

        setNextPageToken(res.data.nextPageToken || null);      
      } catch (error) {
        console.error('Error fetching attachments:', error);
      } finally {
        setIsLoading(false);        
      }
    }
  };



  const handleMailClick = async (index) => {
    setSelectedIndex(index);
    setIsDownloaded(false)
    setDownloaded([]);
  }

  const fetchImageDownloaded = (selectedIndex) => {
    if(selectedIndex >= 0 && !isDownloaded ){    
      maildata[selectedIndex].attachments.map((item) => {      
        setDownloaded((prev) => [ ...prev, item.filename] ) 
      })
      setIsDownloaded(true)
    }
  }

  const handleDownload = async (attachment) => {
    try {
      const response = await fetch('/api/save-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: attachment.filename,
          data: attachment.data.data, 
        }),
      });

    

      const result = await response.json();
        if (result.success) {
          alert('File saved successfully!');  
        } else {
          alert('File save failed');
        }
    } 
    catch (e) {
      console.error('Failed to download attachment:', e);
    }
  };

  const defaultImage = (item) => {

    const extension = item.split('.').pop().toLowerCase();   
   
    console.log(item)
    switch(extension){
      case 'txt':
        return '../../assets/downloads/text_file.png'
      case 'pdf':
        return '../../assets/downloads/pdf_file.png'
      case 'doc': case 'docx':
        return '../../assets/downloads/doc_file.png'

      default: 
        return '../../assets/downloads/default-download.png'
     }
  }

  
  
  

  useEffect(() => {
    if (session && !hasFetchedData) {       
      fetchAttachments(nextPageToken);    
      setHasFetchedData(true);       
    }
    fetchImageDownloaded(selectedIndex)
  }, [session, hasFetchedData, selectedIndex, isDownloaded]);

  return (
    <main id="main" className="float-left w-[1830px] h-[900px]">
      <div className="float-left w-[345px] mt-5 h-[800px]">
        <div className="w-[345px] h-[130px] border-t border-gray-300">
          <form className="max-w-md mx-3 my-2">   
            <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-100 sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
              </div>
              <input 
                type="search" 
                id="default-search" 
                className="block w-full p-4 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 
                focus:ring-blue-500 
                focus:border-blue-500 
                dark:bg-gray-100 dark:border-gray-600 dark:placeholder-gray-400 dark:text-dark dark:focus:ring-blue-500 
                dark:focus:outline-none" 
                placeholder="Search Mockups, Logos..." 
                required 
              />
              <button 
                type="submit" 
                className="absolute right-2.5 bottom-2.5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2"
              >
                Search
              </button>
            </div>
          </form>
          
         
        
        </div>

        <div className="mail-section-container clear-left overflow-y-scroll max-h-[790px] max-w-[345px] scrollbar-none border-t border-b border-gray-300 scrollbar-hide">              
          {maildata.map((data, index) => (
            <button 
              key={index} 
              className={`w-[330px] text-left mail-section ${selectedIndex === index ? 'bg-blue-200': 'bg-blue-50'}  hover:bg-blue-200`} 
              onClick={() => { handleMailClick(index); }} 
            >            
              <div className="w-[325px] h-[75px] list-mail-info">            
                <div className="float-left w-[230px] ml-3">
                  <p className="text-l font-bold mt-3">{getUsernameOrEmail(data.from)}</p>
                  <p className="whitespace-nowrap overflow-hidden truncate max-w-[300px] inline-block text-gray-600">{data.subject || "No Subject"}</p>
                </div>
              </div>            
            </button>
          ))}
        </div>

        {nextPageToken && !isLoading && (
          <button onClick={() => fetchAttachments(nextPageToken)} className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
            Load More
          </button>
        )}
      </div>

      <div className="float-left mt-5 w-[1150px] h-[950px] border border-gray-300">
        {selectedIndex >= 0 && (
          <div className=''>
            <div className="bg-gray-100 h-[70px] border-b border-gray-300"> 
              
              <div className="float-left ml-5 mt-2 max-w-[55px]">
                <img src="../../assets/icons/profile.png" />
              </div>

              <div className="float-left ml-5">
                <p className="text-xl font-bold mt-2"> {getUsername(maildata[selectedIndex]?.from)} </p>
                <p className="mt-1 text-sm text-gray-500">from: &lt;{getEmail(maildata[selectedIndex].from)}&gt; </p>
              </div>                
            </div>

            <div className="content text-left mx-4 mt-4 overflow-y-scroll max-h-[700px] w-[1133px] ">
              <div className="text-left">                       
                <span className="font-bold text-xl"> {maildata[selectedIndex].subject} </span>
              </div>
              
              <div className="">




              {isDownloaded &&   
              (<div>
                
                {downloaded.map((item, index) => (                  
                  <div key={index} className="">                     
                    <img src={`../../downloads/${item}`} alt={`Image ${index}`} width={200} onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = defaultImage(item); 
                    }} />
                  </div>
                ))}
              </div>)
              
              }

              </div>

              <div>
                {maildata[selectedIndex].attachments.map((attachment, index) => ( 
                  <div key={index}>
                    {attachment.data.data && 
                      <button 
                        onClick={() => handleDownload(attachment)} 
                        className="border border-black px-2 py-1 rounded"
                      >
                        {attachment.filename}
                      </button>
                    }     
                  </div>
                ))}
              </div>

              <div dangerouslySetInnerHTML={{ __html: maildata[selectedIndex].content }}></div>    

            </div>    
          </div>
        )}
      </div>

      <div className="float-left w-[320px] h-[900px] mt-5 border-t border-r border-b border-gray-300">
        <h1>mail-info</h1>
        {isDownloaded &&   
          downloaded.map((item, index) => (
            <div key={index}>
              <img src={`../../downloads/${item}`} alt={`Image ${index}`} width={100} />
            </div>
          ))
        }
      </div>
    </main>

  )
};


