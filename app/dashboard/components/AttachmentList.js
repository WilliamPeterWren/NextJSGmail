import { useEffect, useState } from 'react';
import { defaultImage} from '../function/imageFunction';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function AttachmentList ({ item, isUserMessage, email, accessToken, isDownloaded, setIsDownloaded }) {
  const [fileExistence, setFileExistence] = useState({});

  const handleDownload = async (attachment, item) => {
    try {
      const mailMessageID = item.messageId.slice(1,-1);

      const gmailResponse = await axios.get(
        `https://gmail.googleapis.com/gmail/v1/users/${email}/messages/${mailMessageID}/attachments/${attachment.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const attachmentData = gmailResponse.data;

      const saveFileResponse = await axios.post('/api/save-file', {
        filename: attachment.filename,
        data: attachmentData.data,
      });

      const message = saveFileResponse.data.success
        ? { title: 'Download Status', text: 'Download file successfully', icon: 'success' }
        : { title: 'Error!', text: 'Something went wrong!', icon: 'error' };

      Swal.fire({
        ...message,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: !saveFileResponse.data.success,
      });

      if (saveFileResponse.data.success) {
        setIsDownloaded(true);
      } else {
        setIsDownloaded(false);
      }

    } catch (error) {
      console.error('Failed to download attachment:', error);
    }
  };

  useEffect(() => {
    const checkFilesExistence = async () => {
      const newFileExistence = {};
      await Promise.all(item.attachments.map(async (attachment) => {
        const filePath = `/downloads/${attachment.filename}`;
        try {
          const response = await fetch(filePath, { method: 'HEAD' });
          newFileExistence[attachment.filename] = response.status !== 404;
        } catch (error) {
          console.error('Error checking file existence:', error);
          newFileExistence[attachment.filename] = false;
        }
      }));
      setFileExistence(newFileExistence);
    };

    checkFilesExistence();
  }, [item.attachments, isDownloaded]);

  return (
    <div className={`flex flex-wrap gap-2 mt-2 ${isUserMessage ? 'justify-end' : ''}`}>
      {item.attachments.map((attachment, index) => {
        const filePath = `/downloads/${attachment.filename}`;
        const displayImage = fileExistence[attachment.filename] ? filePath : defaultImage(attachment);
        return (
          <div key={index}  >
            <div
              className="relative w-[155px] aspect-square mb-10 border border-gray-300 rounded-lg overflow-hidden hover:border-blue-500"                  
            >
              <img
                className="object-cover w-full h-full"
                src={displayImage}
                alt={attachment.filename}
                loading="lazy"
              />
              <div className="absolute top-2 right-2 flex items-center justify-center z-10" id={`already-downloaded-${index}`}>
                {!fileExistence[attachment.filename] && (
                  <div className="relative group">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(attachment, item);
                      }}
                      className="hover:bg-indigo-400 p-2 rounded text-white"
                    >
                      <img className="w-[40px]" src="/assets/icons/not-download.png" loading="lazy" />
                    </button>
                    <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full mt-4 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      {attachment.filename}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};