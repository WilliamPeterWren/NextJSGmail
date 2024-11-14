import { useSession } from 'next-auth/react';

import { useState, useEffect } from 'react'

function getGreeting() {
  const currentHour = new Date().getHours();
  if (currentHour >= 6 && currentHour < 12) {
    return "Good Morning";
  }
  else if (currentHour >= 12 && currentHour < 18) {
    return "Good Afternoon";
  }
  else if (currentHour >= 18 && currentHour < 24) {
    return "Good Evening";
  }
  else {
    return "Online so late? ...";
  }
}

export default function Greet() {
  const { data: session } = useSession();
  
  const [greet, setGreet] = useState("Hello");
  const [username, setUsername] = useState("")
  
  useEffect(() => {

    if (session) {
      setUsername(session.user?.name);
    }

    const currentGreeting = getGreeting();
    setGreet(currentGreeting);
  }, []);

    return (
        <div className='border-b border-gray-300'>
            <span className='ml-4'> <i>{greet}</i> <b>{username}</b></span>
        </div>
    )
}