import { createSlice } from '@reduxjs/toolkit';

const threadDataArraySlice = createSlice({
  name: 'thread',
  initialState: { 
    allThread: [],
  },
  reducers: {
    addThread: (state, action) => {
      const currentArray = state[action.payload.name] || [];
      const incomingData = action.payload.data;
      const existingItems = currentArray.find(item => item.threadId === incomingData.threadId);

      if(!existingItems){
        state[action.payload.name] = [...currentArray, incomingData];
      }
    },

    updateIsRead: (state, action) => {
      const { threadId, isRead, name } = action.payload;
      const currentArray = state[name] || [];      

      state[name] = currentArray.map(item => 
        item.threadId === threadId ? { ...item, isRead } : item
      );
    },
 
  },
});

export const { addThread, updateIsRead } = threadDataArraySlice.actions;
export default threadDataArraySlice.reducer;
