// app/dashboard/inbox/ReplyModal.js

import { useSession } from 'next-auth/react';
import {useState} from 'react'
import axios from 'axios';
import Swal from 'sweetalert2';

export default function ForwardModal({ 
  isOpen, 
  closeModal, 
  title, 
  children, 
  originalMessageContent, 
  subject, 
}) {
  if (!isOpen) 
    return null;

  const { data: session } = useSession();
  const [forwardText, setForwardText] = useState("");
  const [forwardTo, setForwardTo] = useState("")
  const [files, setFiles] = useState(null);
  const [originalMessageContentForward, setOriginalMessageContentForward] = useState("")

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setFiles(files);
  };

  const handleForward = async () => {
    try {

      let filesData = [];

      if (files) {
        filesData = await Promise.all(
          files.map(async (file) => {
            const base64 = await fileToBase64(file);
            return { name: file.name, type: file.type, data: base64 };
          })
        );
      }

      const response = await axios.post('/api/forward', {
        subject: subject,
        forwardText: forwardText,
        to: forwardTo,
        fromName: session.user.name,
        fromEmail: session.user.email,    
        accessToken: session.accessToken,
        files: filesData,   
        originalMessageContent: originalMessageContent,
      });

      console.log(originalMessageContentForward)

      if (response.status === 200) {
 
        Swal.fire({
          title: 'Forward status',
          text: 'Mail forward successfully',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true
        });
        closeModal();
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong!',
        icon: 'error',
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-50">
      <div className="bg-white w-[600px] h-[400px] lg:w-[800px] lg:h-[600px] rounded-lg shadow-lg p-6 overflow-y-auto">
        <div className='w-full'>
          {children}
          <div className='flex items-center justify-center float-left' >
            <span className="text-2xl font-bold text-rose-500">{title}</span>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={closeModal}
              className="text-white focus:outline-none"
            >
              <img 
                className="w-10 rounded-md border border-transparent hover:border-blue-300 focus:border-red-200 focus:outline-none object-cover" 
                alt="close" 
                src="../../../assets/icons/close.webp" 
              />
            </button>
          </div>



        </div>

               
        <hr className="border-t border-gray-300 my-4 clear-left" />
        <div>
          <p className='border border-blue-200 rounded-lg p-2 bg-indigo-50'>
            <b> <i>Subject:</i> {subject}</b>
          </p>

          <br />

          <div 
            tabIndex={0}
            className='border border-blue-200 rounded-lg pl-2 bg-indigo-50 focus:outline-none focus:ring focus:ring-rose-400'
            >
            <b><i>To:</i></b>
            <input 
                className='border-0 p-2 outline-none bg-indigo-50 w-11/12' 
                type='text' 
                autoFocus 

                onChange={(e) => setForwardTo(e.target.value)}
            />
          </div>



          <span className='text-xl'><b>Content:</b></span>

          <textarea
            className='border border-gray-300 p-4 rounded-lg hover:border-blue-300 focus:border-red-200 focus:outline-none w-full h-400 resize-none' 
            // placeholder={originalMessageContent} 
            defaultValue={originalMessageContent}          
            // onChange={(e) => setOriginalMessageContentForward(e.target.value)}
            rows={10} 
          />
        </div>

        <div className="flex justify-between items-center w-full">
          <div className="relative inline-block">
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => {
                handleFileUpload(e)
              }}
              multiple
            />
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              
            >
              Add File
            </button>
          </div>
          
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700"
            onClick={() => { handleForward(); }}
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}
