import { useSession } from 'next-auth/react';

import { getUsernameOrEmail } from '../function/getNameEmail';
import { useSelector, useDispatch } from 'react-redux';
import { incrementCount, resetCount } from '@/app/store/slice/countSlice';
import { formatDate } from '../function/dateTime';


export default function DownLeftMain({mailData, handleMailClick, selectedIndex, fetchThread, isLoading, loadMore }){
  const { data: session } = useSession();

  const labelIds = useSelector(state => state.labelIds.labelIds);
  const secondLabelIds = useSelector(state => state.labelIds.secondLabelIds);

  const dispatch = useDispatch();

  const handleLoadMore = () => {
    dispatch(resetCount());
    fetchThread(labelIds, secondLabelIds, session, dispatch, incrementCount)
  }


  return(
    <div>
        <div className="mail-section-container mt-8 clear-left overflow-y-scroll max-h-[780px] max-w-full lg:max-w-[345px] scrollbar-none border-t border-b border-gray-300 scrollbar-hide">
            {mailData?.map((data, index) => (
            <button
                key={index}
                className={`w-full lg:w-[330px] text-left mail-section ${selectedIndex === index ? 'bg-blue-200' : 'bg-blue-50'} hover:bg-blue-200`}
                onClick={() => { handleMailClick(index); }}
            >
                <div className="w-full lg:w-[325px] h-[75px] list-mail-info">
                <div className="float-left w-[230px] ml-3">
                    <div className="flex justify-between items-center mt-3">
                      <span className={`text-l ${data.isRead ? "font-medium" : "font-bold"} truncate max-w-full`}> 
                        {getUsernameOrEmail(data.from)} </span>
                      <span className="text-xs -mr-20 border border-indigo-200 rounded-md p-1 text-blue-500">{formatDate(data.date)}</span>
                    </div>
                    <p className="text-sm whitespace-nowrap overflow-hidden truncate max-w-full lg:max-w-[300px] inline-block text-gray-600">{data.subject || "No Subject"}</p>
                </div>
                </div>
            </button>
            ))}
        </div>

        <div className='border-b border-gray-300'>
          {loadMore ? 
          (
            <button onClick={() => handleLoadMore() } className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 ">
              {isLoading ? 'loading' : 'Load More'}
            </button> 
          ) : (
            <div className="text-center text-gray-500 text-sm mt-2">No more emails</div>
          )        
        }
        </div>
    </div>
  )
}