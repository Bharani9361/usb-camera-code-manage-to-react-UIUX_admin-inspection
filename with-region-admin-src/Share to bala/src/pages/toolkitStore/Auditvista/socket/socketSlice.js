import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: false,
  messages: [],
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnected: (state, action) => {
      state.connected = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
});

export const { setConnected, addMessage } = socketSlice.actions;

export default socketSlice.reducer;