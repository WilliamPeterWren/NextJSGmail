import dynamic from 'next/dynamic';

const UpLeftMain = dynamic(() => import('./UpLeftMain'), {ssr: false });
const DownLeftMain = dynamic(() => import('./DownLeftMain'), {ssr: false });

export default function LeftMain({setIsComposeModal, mailData, handleMailClick, selectedIndex, isLoading, fetchThread, loadMore}){

  return (
    <div className="float-left w-full lg:w-[345px] mt-5 h-[800px]">
        <UpLeftMain setIsComposeModal={setIsComposeModal} />
        <DownLeftMain mailData={mailData} handleMailClick={handleMailClick} selectedIndex={selectedIndex} isLoading={isLoading} fetchThread={fetchThread} loadMore={loadMore} />        
    </div>
  )
}