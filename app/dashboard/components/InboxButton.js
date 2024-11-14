import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLabelIds } from '../../store/slice/labelIdsSlice';
import { resetCount } from '../../store/slice/countSlice';

export default function InboxButton({ setIsComposeModal }) {
  const [activeButton, setActiveButton] = useState("Thư đến");
  const dispatch = useDispatch();

  const inboxCounts = {
    'Cập nhật': useSelector(state => state.arrays.inboxUpdate),
    'Diễn đàn': useSelector(state => state.arrays.inboxForum),
    'Mạng xã hội': useSelector(state => state.arrays.inboxSocial),
    'Quảng cáo': useSelector(state => state.arrays.inboxPromotion)
  };

  const handleButtonClick = (label, labelIds) => {
    setActiveButton(label);

    if (label === "Soạn thư") {
      setIsComposeModal(true);
    } else if (inboxCounts[label]?.length === 0) {          
      dispatch(resetCount());
      dispatch(setLabelIds(labelIds));
    }
    else if (inboxCounts[label]?.length > 0){
      dispatch(setLabelIds(labelIds));
    }

  };

  const buttonsData = [
    {
      src: "../../assets/icons/compose.webp",
      alt: "Compose Icon",
      label: "Soạn thư",
      onClick: () => handleButtonClick("Soạn thư")
    },
    {
      src: "../../assets/icons/cap-nhat.png",
      alt: "Updates Icon",
      label: "Cập nhật",
      onClick: () => handleButtonClick("Cập nhật", { labelIds: "INBOX", secondLabelIds: "CATEGORY_UPDATES" })
    },
    {
      src: "../../assets/icons/forums.png",
      alt: "Forums Icon",
      label: "Diễn đàn",
      onClick: () => handleButtonClick("Diễn đàn", { labelIds: "INBOX", secondLabelIds: "CATEGORY_FORUMS" })
    },
    {
      src: "../../assets/icons/mang-xa-hoi.png",
      alt: "Social Icon",
      label: "Mạng xã hội",
      onClick: () => handleButtonClick("Mạng xã hội", { labelIds: "INBOX", secondLabelIds: "CATEGORY_SOCIAL" })
    },
    {
      src: "../../assets/icons/quang-cao.webp",
      alt: "Promotions Icon",
      label: "Quảng cáo",
      onClick: () => handleButtonClick("Quảng cáo", { labelIds: "INBOX", secondLabelIds: "CATEGORY_PROMOTIONS" })
    }
  ];

  return (
    <div className="flex flex-wrap">
      {buttonsData.map((button, index) => (
        <div key={index} className="relative w-12 m-2 group">
          <button
            className={`rounded-full p-0.5 ${button.label === activeButton ? 'bg-blue-300' : 'hover:bg-blue-300'}`}
            onClick={button.onClick}
          >
            <img src={button.src} alt={button.alt} loading="lazy" />
          </button>
          <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {button.label}
          </div>
        </div>
      ))}
    </div>
  );
}
