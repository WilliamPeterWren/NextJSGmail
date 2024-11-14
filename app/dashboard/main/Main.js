import dynamic from 'next/dynamic';

const UpMain = dynamic(() => import('./UpMain'), {ssr: false });
const DownMain = dynamic(() => import('./DownMain'), {ssr: false });

export default function Main({fromUsername, fromEmail, mailData, setHoveredIndex, hoveredIndex, handleDownload, handleReplyMessage, handleForwardMessage, endOfMessagesRef, isLoading, isDownloaded, setIsDownloaded}) {

  if(isLoading){
    return (
      <div className="flex items-center justify-center float-left mt-5 w-full lg:w-[1150px] h-[990px] border border-gray-300">
        <img className="max-w-lg" alt="loading" src="assets/icons/loading.webp" />
      </div>

    )
  }

  if(!mailData){
    return;
  }

  return (
    <div className="float-left mt-5 w-full lg:w-[1150px] h-[990px] border border-gray-300">
        <div className='h-[790px]'>          
          <div className=''>
            <UpMain fromUsername={fromUsername} fromEmail={fromEmail} />
            <DownMain mailData={mailData} setHoveredIndex={setHoveredIndex} hoveredIndex={hoveredIndex} handleDownload={handleDownload} handleReplyMessage={handleReplyMessage} handleForwardMessage={handleForwardMessage} endOfMessagesRef={endOfMessagesRef} isDownloaded={isDownloaded} setIsDownloaded={setIsDownloaded} />
          </div>          
        </div>
    </div>
  )
}