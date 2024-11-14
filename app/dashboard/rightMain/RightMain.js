import { useEffect, useState } from 'react';


import { defaultImage } from '../function/imageFunction';

export default function RightMain({mailData, fromEmail, fromUsername, isDownloaded}) {

  if(!mailData?.thread){
    return
  }

  const openImageInDesktopApp = (imageUrl) => {
    window.open(imageUrl, '_blank');
  };

  const [fileExistence, setFileExistence] = useState({});


  useEffect(() => {
    const checkFilesExistence = async () => {
      const newFileExistence = {};
      await Promise.all(mailData.thread.map(async (attachment) => {    
        const attachments = attachment.attachments || [];
            return attachments.map(async (item) => {
              const filePath = `/downloads/${item.filename}`;
              try {
                const response = await fetch(filePath, { method: 'HEAD' });
                newFileExistence[item.filename] = response.status !== 404;
              } catch (error) {
                console.error('Error checking file existence:', error);
                newFileExistence[item.filename] = false;
              }   
              setFileExistence(newFileExistence);
            })        
        }));
    };

    checkFilesExistence();
  }, [mailData.thread, isDownloaded]);

  return(
    <div className="float-left w-full lg:w-[320px] h-[990px] mt-5 border-t border-r border-b border-gray-300">
        <div className='h-[62px] border-b border-gray-300 justify-items'>
          <h1 className='text-center mt-2 font-bold'>Mail info</h1>
        </div>

        <div className=''>
          <div className='h-[80px] flex items-center justify-center'>
            <div className="ml-5 max-w-[55px]">
              <img src="../../assets/icons/profile.png" alt="profile" />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <p className="text-xl font-bold mt-2">{fromUsername || "Unknown"}</p>
          </div>
          <div className="flex items-center justify-center">
            <p className="mt-1 text-sm text-gray-500">&lt;{fromEmail[0]}&gt;</p>
          </div>
        </div>

        <div className='border-t border-gray-300' >
        {fromEmail.length > 1 && (
          <div>
              <p className='font-bold mt-2 ml-3'>In thread:</p>
              <div className='content border-b border-gray-300 h-[100px] overflow-y-scroll'>
              {fromEmail.map((to, index) => (
                <div key={index} className='float-left mx-2'>
                  <p className='text-md text-blue-500'> &lt;{to}&gt; </p>
                </div>
              ))}
              </div>
          </div>
        )}
        </div>

        <hr className="border-t-4 border-b-4 border-gray-200" />

        <p className='font-bold mt-2 ml-3 border-b border-gray-300'>Files</p>
        <div className='content mt-4 border-b border-gray-300 h-[300px] overflow-y-scroll'>
          <div className='ml-2 flex flex-wrap gap-1'>
          {mailData.thread.map((item) => {
            const attachments = item.attachments || [];
            return attachments.map((attachment, index) => { 
              const filePath = `/downloads/${attachment.filename}`;
              const displayImage = fileExistence[attachment.filename] ? filePath : defaultImage(attachment);  
              return (
                <div
                  className="relative w-[83px] aspect-square m-1 border border-gray-300 rounded-lg overflow-hidden hover:border-blue-500"
                  key={index} 
                  onClick={() => openImageInDesktopApp(displayImage)}
                >
                  <img
                    className="object-cover w-full h-full"
                    src={displayImage}
                    alt={attachment.filename}
                    loading='lazy'
                  />                      
                </div>
          )})})}
          </div>
        </div>
    </div>
  )
}