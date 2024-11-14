// app/dashboard/page.js

"use client";

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';

import { addItem } from '../store/slice/multiArraySlice';
import { incrementCount, setCountValue } from '../store/slice/countSlice';
import { setPageToken } from '../store/slice/pageTokenSlice';
import { addThread, updateIsRead } from '../store/slice/threadDataArraySlice';

import { getUsername, getEmail } from './function/getNameEmail';
import { getCurrentDate } from './function/dateTime';
import markThreadAsRead from './function/markAsRead';

import { LoginURL } from '../api/config/config';


import dynamic from 'next/dynamic';

const ReplyModal = dynamic(() => import('./modal/ReplyModal'), { ssr: false });
const ComposeModal = dynamic(() => import('./modal/ComposeModal'), { ssr: false });
const ForwardModal = dynamic(() => import('./modal/ForwardModal'), { ssr: false });

const LeftMain = dynamic(() => import('./leftMain/LeftMain'), {ssr: false });
const Main = dynamic(() => import('./main/Main'), {ssr: false });
const RightMain = dynamic(() => import('./rightMain/RightMain'), {ssr: false });


export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const endOfMessagesRef = useRef(null);

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadMore, setLoadMore] = useState(false);

  const [isReplyModal, setIsReplyModal] = useState(false);
  const [isComposeModal, setIsComposeModal] = useState(false);
  const [isForwardModal, setIsForwardModal] = useState(false);
  
  const [fromUsername, setFromUsername] = useState([])
  const [fromEmail, setFromEmail] = useState([]);
  const [mailData, setMailData] = useState();
  
  // Reply
  const [replySubject, setReplySubject] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [replyCc, setReplyCc] = useState([]);
  const [replyThreadId, setReplyThreadId] = useState("");
  const [replyInReplyTo, setReplyInRepyTo] = useState("")
  const [replyReferences, setReplyReferences] = useState("")
  const [oldReplyText, setOldReplyText] = useState("")
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Forward
  const [originalMessageContent, setOriginalMessageContent] = useState("");
  const [forwardSubject, setForwardSubject] = useState("");

  // Download
  const [isDownloaded, setIsDownloaded] = useState(false);

  const allThread = useSelector(state => state.thread.allThread)

  const inboxPrimary = useSelector(state => state.arrays.inboxPrimary);
  const inboxUpdate = useSelector(state => state.arrays.inboxUpdate);
  const inboxForum = useSelector(state => state.arrays.inboxForum);
  const inboxSocial = useSelector(state => state.arrays.inboxSocial);
  const inboxPromotion = useSelector(state => state.arrays.inboxPromotion);

  const sent = useSelector(state => state.arrays.sent);
  const important = useSelector(state => state.arrays.important);
  const spam = useSelector(state => state.arrays.spam);
  const starred = useSelector(state => state.arrays.starred);

  const count = useSelector((state) => state.count.value);
  
  const labelIds = useSelector(state => state.labelIds.labelIds);
  const secondLabelIds = useSelector(state => state.labelIds.secondLabelIds);

  const inboxToken = useSelector((state) => state.pageToken.inboxToken);
  const sentToken = useSelector((state) => state.pageToken.sentToken);
  const importantToken = useSelector((state) => state.pageToken.importantToken);
  const spamToken = useSelector((state) => state.pageToken.spamToken);
  const starredToken = useSelector((state) => state.pageToken.starredToken);


  const dispatch = useDispatch();

  const fetchThread = async (labelIds, secondLabelIds, session, dispatch, incrementCount) => {
    try {

      const pageToken = {
        INBOX: inboxToken,
        SENT: sentToken,
        IMPORTANT: importantToken,
        SPAM: spamToken,
        STARRED: starredToken,
      }

      setIsLoading(true)
      const maxResults = 50;

      let res = null;
      if(labelIds === 'INBOX'){
        res = await axios.get('/api/gmail', {
          params: {
            accessToken: session.accessToken,
            pageToken: pageToken[labelIds],
            maxResults: maxResults,
            labelIds: labelIds,
            labelIds: secondLabelIds,
          },
        });
      }
      else {
        res = await axios.get('/api/gmail', {
          params: {
            accessToken: session.accessToken,
            pageToken: pageToken[labelIds],
            maxResults: maxResults,
            labelIds: labelIds,           
          },
        }); 
      }

      const labelToken = {
        INBOX: 'inboxToken',
        SENT: 'sentToken',
        IMPORTANT: 'importantToken',
        SPAM: 'spamToken',
        STARRED: 'starredToken',
      }

      const nextPageToken = res.data.nextPageToken;
      dispatch(setPageToken({ key: labelToken[labelIds], value: nextPageToken })); 
      setLoadMore(nextPageToken !== undefined);
      if(nextPageToken === undefined){      
        dispatch(setCountValue({ value: 10 }));
      }
      else{      
        incrementCount(); 
      }   
      
      const messages = res.data.threads || [];
      const labelMapping = {
        CATEGORY_PERSONAL: 'inboxPrimary',
        CATEGORY_UPDATES: 'inboxUpdate',
        CATEGORY_FORUMS: 'inboxForum',
        CATEGORY_SOCIAL: 'inboxSocial',
        CATEGORY_PROMOTIONS: 'inboxPromotion',
        SENT: 'sent',
        IMPORTANT: 'important',
        STARRED: 'starred',
        SPAM: 'spam',
      };

      const category = labelIds === 'INBOX' ? labelMapping[secondLabelIds] : labelMapping[labelIds];
      if (category) {
        dispatch(addItem({ name: category, data: messages })); 
      }

      setIsLoading(false)
    } catch (error) {
      console.log(error);
    }
  };

  const fetchEmailByThreadId = async (accessToken, threadId) => {
    // console.log("fetching email")
    try {
      setIsLoading(true);
      const response = await axios.get('/api/get-one', {
        params: { 
          accessToken, 
          threadId 
        },
      })

      const data = response.data;

      console.log(data);

      dispatch(addThread({ name: 'allThread', data: data }))
      setMailData(data); 
    
      setEmailUsername(data);

      setIsLoading(false);
    } catch (err) {
      console.log(err);
    } 
  };

  const getMailData = (labelIds, secondLabelIds, data) => {
    const { inboxPrimary, inboxUpdate, inboxForum, inboxSocial, inboxPromotion, sent, important, spam, starred } = data;

    if (labelIds === 'INBOX') {
      switch (secondLabelIds) {
        case 'CATEGORY_PERSONAL':
          return inboxPrimary;
        case 'CATEGORY_UPDATES':
          return inboxUpdate;
        case 'CATEGORY_FORUMS':
          return inboxForum;
        case 'CATEGORY_SOCIAL':
          return inboxSocial;
        default:
          return inboxPromotion;
      }
    }

    switch (labelIds) {
      case 'SENT':
        return sent;
      case 'IMPORTANT':
        return important;
      case 'SPAM':
        return spam;
      case 'STARRED':
        return starred;
      default:
        return null;
    }
  };

  const setEmailUsername = (mail) => {
    mail.thread.map(item => {
      const email = getEmail(item.from);
      const username = getUsername(item.from);

      setFromEmail(prev =>
        (prev.includes(email) || email === session?.user.email) ? prev : [...prev, email]
      );

      setFromUsername(prev =>
        (prev.includes(username) || username === session?.user.name) ? prev : [...prev, username]
      );
    })
  }

  const handleMailClick = async (index) => {

    const mailArray = getMailData(labelIds, secondLabelIds, {
      inboxPrimary,
      inboxUpdate,
      inboxForum,
      inboxSocial,
      inboxPromotion,
      sent,
      important,
      spam,
      starred
    });

    setFromEmail([]);
    setFromUsername([]); 

    const thread = mailArray[index]; 

    setSelectedIndex(index);
  
    const threadId = thread.threadId;
    const mail = allThread?.find(item => item?.threadId === threadId );

    if (mail === undefined) {    
      fetchEmailByThreadId(session.accessToken, threadId);
    }
    else{     
      console.log(mail);
      setMailData(mail);
      setEmailUsername(mail);
    }

    if (!thread.isRead) {
      markThreadAsRead(threadId, session.accessToken);      
      dispatch(updateIsRead({ threadId: threadId, isRead: true, name: 'allThread' }));
    }
  }

  const handleReplyMessage = (to, from) => {
    setIsReplyModal(true);

    mailData.thread.forEach(item => {
      const username = getUsername(item.from);
      const email = getEmail(item.from);

      setFromUsername((prev) => {
        if (!prev.includes(username)) {
          return [...prev, username];
        }
        return prev;
      });

      setFromEmail((prev) => {
        if (!prev.includes(email)) {
          return [...prev, email];
        }
        return prev;
      });
    });


    setReplySubject(mailData.thread[0].subject);

    const recipient = mailData.thread.slice().reverse().find(item => getEmail(item.from) !== session.user.email);
    if (recipient) {
      setReplyTo(getEmail(recipient.from));
    }

    setReplyThreadId(mailData.threadId);
    setReplyInRepyTo(mailData.thread[hoveredIndex].messageId);
    setReplyReferences(mailData.thread[hoveredIndex].references ? mailData.thread[hoveredIndex].references + " " + mailData.thread[hoveredIndex].messageId : mailData.thread[hoveredIndex].messageId);
    setOldReplyText(mailData.thread[hoveredIndex].content)

    const uniqueCcList = [...to, from].filter(
      (item, index, self) => self.indexOf(item) === index && getEmail(item) !== session.user.email
    );

    setReplyCc(uniqueCcList);
  }

  const closeReplyModal = () => { 
    setIsReplyModal(false); 
  }

  const handleForwardMessage = (i) => {
    setIsForwardModal(true);

    const message = mailData.thread
    message.map(item => {
      const username = getUsername(item.from);
      const email = getEmail(item.from);

      setFromUsername((prev) => {
        if (!prev.includes(username)) {
          return [...prev, username];
        }
        return prev;
      });

      setFromEmail((prev) => {
        if (!prev.includes(email)) {
          return [...prev, email];
        }
        return prev;
      });
    });

    setOriginalMessageContent((prev) => {
      const tempElement = document.createElement('div');
      tempElement.innerHTML = i.contentHtml || i.content;

      const plainTextContent = tempElement.innerHTML
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/div>/gi, '\n')
        .replace(/<\/p>/gi, '\n')
        .replace(/&nbsp;/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .trim();

      const recipients = i.to.map((recipient) => `${getUsername(recipient)} <${getEmail(recipient)}>`).join(', ');

      return [
        ...prev,
        `---------- Forwarded message ----------\nFrom: ${getUsername(i.from)} <${getEmail(i.from)}>\nDate: ${getCurrentDate()}\nSubject: ${message[0].subject}\nTo: ${recipients}\n\n\n${plainTextContent}`
      ];
    });

    setForwardSubject(message[0].subject)
  }

  const closeForwardModal = () => {
    setIsForwardModal(false);
    setOriginalMessageContent("");
  }

  const closeComposeModal = () => { 
    setIsComposeModal(false) 
  }

  useEffect(() => {
    const fetchMessages = async () => {
      if (session && count < 1) {
        await fetchThread(labelIds, secondLabelIds, session, dispatch, () => dispatch(incrementCount()));
      }
    };

    fetchMessages();

    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session, count]);



  return (
    <main className="float-left w-full lg:w-[1830px] h-[990px]">
      
      <LeftMain 
        setIsComposeModal={setIsComposeModal} 
        mailData={getMailData(labelIds, secondLabelIds, {
          inboxPrimary,
          inboxUpdate,
          inboxForum,
          inboxSocial,
          inboxPromotion,
          sent,
          important,
          spam,
          starred
        })}
        handleMailClick={handleMailClick} 
        selectedIndex={selectedIndex}           
        fetchThread={fetchThread} 
        isLoading={isLoading} 
        loadMore={loadMore}
      />
      
      <Main  
        fromUsername={fromUsername} 
        fromEmail={fromEmail}        
        mailData={mailData} 
        setHoveredIndex={setHoveredIndex} 
        hoveredIndex={hoveredIndex}  
        handleReplyMessage={handleReplyMessage} 
        handleForwardMessage={handleForwardMessage} 
        endOfMessagesRef={endOfMessagesRef} 
        isLoading={isLoading}
        setIsDownloaded={setIsDownloaded}
        isDownloaded={isDownloaded}
      />      

      <div className='flex justify-between items-center'>
        <ReplyModal
          isOpen={isReplyModal}
          closeModal={closeReplyModal}
          title="Reply"
          // oldReplyText={oldReplyText}
          subject={replySubject}
          replyTo={replyTo}
          Cc={replyCc}
          inReplyTo={replyInReplyTo}
          references={replyReferences}
          threadId={replyThreadId}

        />
        

        <ForwardModal
          isOpen={isForwardModal}
          closeModal={closeForwardModal}
          title="Forward"
          originalMessageContent={originalMessageContent}
          subject={forwardSubject} 
        />
      

        <ComposeModal 
          isOpen={isComposeModal} 
          closeModal={closeComposeModal} 
          title="Compose" 
        />
          
      </div>

      <RightMain 
        mailData={mailData}     
        fromEmail={fromEmail} 
        fromUsername={fromUsername}
        setIsDownloaded={setIsDownloaded}
        isDownloaded={isDownloaded}
      />
    </main>
  )
};