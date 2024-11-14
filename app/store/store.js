// store.js
import { configureStore } from '@reduxjs/toolkit';

import multiArrayReducer from './slice/multiArraySlice';
import labelIdsRuducer from './slice/labelIdsSlice';
import countReducer from './slice/countSlice';
import pageTokenReducer from './slice/pageTokenSlice';
import threadArrayReducer from './slice/threadDataArraySlice';


const store = configureStore({
  reducer: {
    arrays: multiArrayReducer,
    labelIds: labelIdsRuducer,
    count: countReducer,
    pageToken: pageTokenReducer,
    thread: threadArrayReducer,
  },
});

export default store;
