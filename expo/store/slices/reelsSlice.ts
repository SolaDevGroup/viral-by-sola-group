import { createSlice } from "@reduxjs/toolkit";

type ReelsState = {
  isMuted: boolean;
};

const initialState: ReelsState = {
  isMuted: false,
};

export const reelsSlice = createSlice({
  name: "reels",
  initialState,
  reducers: {
    toggleMute(state) {
      state.isMuted = !state.isMuted;
    },
    setMuted(state, action) {
      state.isMuted = action.payload;
    },
  },
});

export const { toggleMute, setMuted } = reelsSlice.actions;
export default reelsSlice.reducer;
