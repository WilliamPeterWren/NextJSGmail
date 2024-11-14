import { createSlice } from '@reduxjs/toolkit';

const pageTokenSlice = createSlice({
  name: 'pageToken',
  initialState: {
    inboxToken: null,
    sentToken: null,
    importantToken: null,
    spamToken: null,
    starredToken: null,
  },
  reducers: {
    setPageToken: (state, action) => {
      const { key, value } = action.payload;      
      state[key] = value;       
    },
    clearPageToken: (state, action) => {
      const { key } = action.payload;  
      state[key] = null;       
    },
    clearAllPageTokens: (state) => {
      state.inboxToken = null;
      state.sentToken = null;
      state.importantToken = null;
      state.spamToken = null;
      state.starredToken = null;
    },
  },
});

export const { setPageToken, clearPageToken, clearAllPageTokens } = pageTokenSlice.actions;
export default pageTokenSlice.reducer;
