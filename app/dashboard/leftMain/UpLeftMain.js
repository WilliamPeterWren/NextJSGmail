import dynamic from 'next/dynamic';

const Search = dynamic(() => import('../components/Search'), { ssr: false });
const Greet = dynamic(() => import('../components/Greet'), {ssr: false });
const InboxButton = dynamic(() => import('../components/InboxButton'), {ssr: false });

export default function UpLeftMain ({setIsComposeModal}) {
    return (
        <div className="w-full lg:w-[345px] h-[130px] border-t border-gray-300 clear-left">
          <Greet />
          <Search />
          <InboxButton setIsComposeModal={setIsComposeModal} />
        </div>
    )
}