// store/slices/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'label',
  initialState: { labelIds: 'INBOX', secondLabelIds: 'CATEGORY_PERSONAL' },
  reducers: {
    setLabelIds: (state, action) => {
      state.labelIds = action.payload.labelIds;     
      state.secondLabelIds = action.payload.secondLabelIds;
    },
    clearLabelIds: (state) => {
      state.labelIds = 'INBOX';     
    },
  },
});

export const { setLabelIds, clearLabelIds } = userSlice.actions;
export default userSlice.reducer;
