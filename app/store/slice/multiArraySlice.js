import { createSlice } from '@reduxjs/toolkit';

const multiArraySlice = createSlice({
  name: 'arrays',
  initialState: {
    
    inboxPrimary: [],
    inboxUpdate: [],
    inboxSocial: [],
    inboxPromotion: [],
    inboxForum: [],

    sent: [],
    important: [],
    spam: [],
    starred: [],
  },
  reducers: {
    setArray: (state, action) => {
      state[action.payload.name] = action.payload.data;
    },
    addItem: (state, action) => {
      const currentArray = state[action.payload.name] || [];
      const incomingData = action.payload.data;  
      const existingItems = currentArray.map(item => item.threadId);
      const newItems = incomingData.filter(item => !existingItems.includes(item.threadId));
      state[action.payload.name] = [...currentArray, ...newItems];
    },

    removeItem: (state, action) => {
      state[action.payload.name] = state[action.payload.name].filter(
        item => item !== action.payload.item
      );
    },
  },
});

export const { setArray, addItem, removeItem } = multiArraySlice.actions;
export default multiArraySlice.reducer;
