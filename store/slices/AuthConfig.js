import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: "",
  isOnBoarding: false,
  unseenNoti: 0,
  isExpired: false,
  onboarded: true,
  showError: false,
  errorMessage: "",
};
export const authConfigsSlice = createSlice({
  name: "authConfigs",
  initialState: initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
    },
    setOnBoarding(state, action) {
      console.log(action.payload);
      state.isOnBoarding = action.payload;
    },
    setUnseenNoti(state, action) {
      state.unseenNoti = action.payload;
    },
    setExpired(state, action) {
      state.isExpired = action.payload;
    },
    setOnBoarded(state, action) {
      state.onboarded = action.payload;
    },
    setShowError(state, action) {
      state.showError = action.payload;
    },
    setErrorMessage(state, action) {
      state.errorMessage = action.payload;
    },
    logout(state, action) {
      state.token = "";
    },
  },
});

export const {
  setToken,
  setOnBoarding,
  setUnseenNoti,
  logout,
  setExpired,
  setOnBoarded,
  setErrorMessage,
  setShowError,
} = authConfigsSlice.actions;

export default authConfigsSlice.reducer;
