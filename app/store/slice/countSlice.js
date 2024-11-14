import { createSlice } from '@reduxjs/toolkit';

const countSlice = createSlice({
  name: 'count',
  initialState: {
    value: 0,
  },
  reducers: {
    setCountValue: (state, action) => {
      state.value = action.payload.value;
    },
    incrementCount: (state) => {
      state.value += 1;
    },
    resetCount: (state) => {
      state.value = 0;
    },
  },
});

export const { setCountValue, incrementCount, resetCount } = countSlice.actions;
export default countSlice.reducer;

