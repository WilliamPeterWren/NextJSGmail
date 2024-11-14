
export default function UpMain({fromUsername, fromEmail}){
    return (
    <div className="bg-gray-100 h-[70px] border-b border-gray-300 flex items-center justify-between">
        <div className="flex items-center ml-5">
            <div className="max-w-[55px]">
            <img src="../../assets/icons/profile.png" alt="profile" loading="lazy" />
            </div>

            <div className="ml-5">
            <div>
                {fromUsername.map((item, index) => {
                return (
                    <span key={index} className="text-xl font-bold mr-2 hover:text-rose-700">
                    {item} <span className='text-sm text-gray-500 font-normal'>&lt;&gt;</span>
                    </span>
                )
                })
                }
            </div>

            <div>
                <span className='mt-1 text-sm text-gray-500 hover:text-green-600'>in thread:</span>
                {
                fromEmail.map((item, index) => {
                    return (
                    <span key={index} className="mt-1 mr-2 text-sm text-gray-500 hover:text-blue-600">
                        &lt;{item}&gt;
                    </span>
                    )
                })
                }
            </div>

            </div>                  
        </div>
    </div>
    )
}