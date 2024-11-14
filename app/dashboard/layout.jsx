// app/dashboard/layout.js
"use client";

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useDispatch, useSelector } from 'react-redux';
import { setLabelIds } from '../store/slice/labelIdsSlice';
import { resetCount } from '../store/slice/countSlice';

import { LoginURL } from '../api/config/config';

export default function DashboardLayout ({ children }) {
  const { data: session } = useSession();
  const [hasFetchedData, setHasFetchedData] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState();
  const [activeButton, setActiveButton] = useState("inbox");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const dispatch = useDispatch();

  const inboxPrimary = useSelector(state => state.arrays.inboxPrimary);

  const sent = useSelector(state => state.arrays.sent);
  const important = useSelector(state => state.arrays.important);
  const spam = useSelector(state => state.arrays.spam);
  const starred = useSelector(state => state.arrays.starred);

  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleButtonClick = (button) => {
    setActiveButton(button.name);     
    dispatch(setLabelIds({ labelIds: button.alt, secondLabelIds: "CATEGORY_PERSONAL" }));

    switch(button.name){

      case 'inboxPrimary':
        if(inboxPrimary.length === 0){
          dispatch(resetCount());
        }
        break;

      case 'sent':
        if(sent.length === 0){
          dispatch(resetCount());
        }
        break;

      case 'important':
        if(important.length === 0){
          dispatch(resetCount());
        }
        break;

      case'spam':
        if(spam.length === 0){
            dispatch(resetCount());
          }
        break;

      case'starred':
        if(starred.length === 0){
          dispatch(resetCount());
        }
        break;
    }

  };

  useEffect(() => {
    if (session && !hasFetchedData) {
      setAvatarUrl(session.user?.image);
      setHasFetchedData(true);
    }
  }, [session, hasFetchedData]);

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  };

  const toggleSidebar = () => {
    setIsMinimized(!isMinimized);
  };

  const buttonData = [
    {
      name: 'inboxPrimary',
      href: '/dashboard',
      src: '../assets/icons/inbox.webp',
      alt: 'INBOX',
      width: 45,
    },
    {
      name: 'sent',
      href: '/',
      src: '../assets/icons/sent.webp',
      alt: 'SENT',
      width: 60,
    },
    {
      name: 'important',
      href: '/',
      src: '../assets/icons/important.png',
      alt: 'IMPORTANT',
      width: 45,
    },
    {
      name: 'spam',
      href: '/',
      src: '../assets/icons/spam.webp',
      alt: 'SPAM',
      width: 45,
    },
    {
      name: 'stared',
      href: '/',
      src: '../assets/icons/stared.png',
      alt: 'STARRED',
      width: 45,
    },
    {
      name: 'reload',
      href: '/',
      src: '../assets/icons/reload.png',
      alt: 'reload',
      width: 45,
      extraClass: 'mt-40',
    },
  ];

  return (
    <div className=''>  
      <div className="flex">
        <nav className="w-[70px] h-[990px] bg-blue-600 bg-left-navbar-color flex flex-col">
          <div className="w-full h-[100px] flex justify-center items-center">
            <img className="rounded-full mt-2" src={avatarUrl} alt="user-avatar" width="55" />
          </div>
          <div className="flex-grow overflow-y-auto mt-4">
            {buttonData.map((button, index) => (
              <div key={index} className="relative group">
                <button
                  className={`w-full p-4 ${activeButton === button.name ? 'bg-left-navbar-color-hover' : 'hover:bg-left-navbar-color-hover'} ${button.extraClass || ''}`}
                  onClick={() => handleButtonClick(button)}
                >
                  {
                    button.name === 'reload' ?  (
                    <Link href={LoginURL}>
                      <img src={button.src} alt={button.alt} width={button.width} loading='lazy' />
                    </Link>
                    ) : (
                      <img src={button.src} alt={button.alt} width={button.width} loading='lazy' />
                    )
                  }
                </button>
                <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-full mt-1 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  {button.name}
                </div>
              </div>
            ))}
          </div>
        </nav>
        <button
          className="absolute right-6 rounded hover:bg-gray-400 transition -mb-40 z-10"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <img src="../../assets/icons/reduce-screen.webp" alt="reduce-screen" width={15} />
          ) : (
            <img src="../../assets/icons/fullscreen.webp" alt="fullscreen" width={15} />
          )}
        </button>
        <main className="flex-grow -mt-5">{children}</main>
      </div>
    </div>
  );
};


