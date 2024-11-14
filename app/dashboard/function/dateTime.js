import moment from 'moment-timezone';


export const formatDateInTimezone = (dateString) => {
  const timezone = 'Asia/Ho_Chi_Minh';
  const date = new Date(dateString);
  date.setHours(date.getHours() + 7);
  const formattedDate = date?.toISOString();
  return moment?.tz(formattedDate, timezone).format('YYYY-MM-DD HH:mm:ss');
};

export const formatDate = (dateString) => {
  const timezone = 'Asia/Ho_Chi_Minh';
  const date = new Date(dateString);
  date.setHours(date.getHours() + 7);
  const formattedDate = date?.toISOString();
  return moment?.tz(formattedDate, timezone).format('YYYY-MM-DD');
};

export const getCurrentDate = () => {
  const date = new Date();
  const day = date.getDay();
  const dayNames = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];

  const dayOfWeek = dayNames[day];
  const dayOfMonth = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${dayOfWeek}, ${dayOfMonth} thg ${month}, ${year} vào lúc ${hours}:${minutes}`;
}