import { useSession } from 'next-auth/react';
import DOMPurify from 'dompurify';



import { getEmail, getUsernameOrEmail } from '../function/getNameEmail';
import { formatDateInTimezone } from '../function/dateTime';
import { defaultImage } from '../function/imageFunction';
import AttachmentList from '../components/AttachmentList';

function replaceLinksWithNextLink(html) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const links = tempDiv.getElementsByTagName('a');
  Array.from(links).forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  return tempDiv.innerHTML;
}



export default function DownMain({mailData, setHoveredIndex, hoveredIndex, handleReplyMessage, handleForwardMessage, endOfMessagesRef, isDownloaded, setIsDownloaded}) {
  const { data: session } = useSession();
  
  const allowedTags = ['b', 'i', 'u', 'a', 'br', 'p', 'div', 'img', 'table', 'tr', 'td', 'th', 'tbody', 'thead', 'tfoot', 'span', 'hr', 'ul', 'li', 'strong', 'font'];

  const filterAllowedHTML = (htmlContent, allowedTags) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    const filterNodes = (node) => {
      const children = Array.from(node.childNodes);
      children.forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) {
          if (!allowedTags.includes(child.tagName.toLowerCase())) {
            child.remove();
          } else {
            filterNodes(child);
          }
        }
      });
    };
    filterNodes(doc.body);
    return doc.body.innerHTML;
  };

  if(!mailData?.thread){
    return
  }

 



  return (
    <div className="content relative text-left px-4 my-4 overflow-y-scroll h-[900px] h-[700px] w-full lg:w-[1145px]  ">
      <div className="text-left my-2 ">
        <span className="font-bold text-xl "> {mailData.thread?.[0].subject} </span>
      </div>

      <hr className='mt-4 border-b border-rose-300 w-5/12' ></hr>
      
      <div className='mb-10'>
      {mailData.thread?.map((item, index) => {
          const isUserMessage = getEmail(item.from) === session?.user.email;
          const filteredContent = filterAllowedHTML(item.contentHtml || item.content, allowedTags);
          const sanitizedContent = DOMPurify.sanitize(filteredContent);
          const contentWithNextLinks = replaceLinksWithNextLink(sanitizedContent);
          return (
          <div
            key={index}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`p-2 rounded-md border rounded-lg my-2 ${isUserMessage ? 'text-right border-blue-300 ml-auto' : 'border-rose-300'}`}
          >
            <div className={`text-xs ${isUserMessage ? 'text-yellow-700' : 'text-violet-700'}`}>
              <div className="border border-purple-200 inline-block p-1 rounded-lg">
                {item?.date && formatDateInTimezone(item.date)}
              </div>
            </div>

            <div className={`text-sm inline-block border-b ${isUserMessage ? 'text-right text-rose-500 border-blue-400' : 'text-indigo-500 border-rose-500'}`}>
              {getUsernameOrEmail(item?.from)}
            </div>

            <div
              className={`${isUserMessage ? 'text-right' : ''}`}
              dangerouslySetInnerHTML={{ __html: contentWithNextLinks  }}
            />

            <div>
            {item.attachments.length > 0 && (
              <div className="text-xs text-gray-600 mt-2">
                {item.attachments.length} attachments
              </div>
            )}
            </div>

         
            <AttachmentList item={item} isUserMessage={isUserMessage} email={session?.user.email} accessToken={session?.accessToken} isDownloaded={isDownloaded} setIsDownloaded={setIsDownloaded} />
          

            <div className="">
            {hoveredIndex === index && (
            <div className="flex gap-2 mt-2">

              <button
                onClick={() => handleReplyMessage(item?.to, getEmail(item?.from))}
                className="bg-blue-500 text-white py-1 px-3 rounded-md"
              >
                Reply
              </button>

              <button
                onClick={() => handleReplyMessage(item?.to, getEmail(item?.from))}
                className={`bg-yellow-500 text-white py-1 px-3 rounded-md ${item?.to?.length <= 1 ? 'hidden' : ''}`}
              >
                Reply All
              </button>

              <button
                onClick={() => handleForwardMessage(item)}
                className="bg-green-500 text-white py-1 px-3 rounded-md"
              >
                Forward
              </button>
            </div>
            )}
            </div>

            <div ref={endOfMessagesRef} />

          </div>
          );
      })}
      </div>
    </div>
  )
}