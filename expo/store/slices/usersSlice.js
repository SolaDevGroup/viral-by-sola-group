import { createSlice } from "@reduxjs/toolkit";

export const usersSlice = createSlice({
  name: "users",
  initialState: {
    userData: {},
    location: {},
    unseenBadge: {},
    role: null,
    created: false,
  },
  reducers: {
    setUserData(state, action) {
      state.userData = action.payload;
      // Set role if provided in userData
      if (action.payload?.role) {
        state.role = action.payload.role;
      }
    },
    setLocation(state, action) {
      state.location = action.payload;
    },
    setUnseenBadge(state, action) {
      state.unseenBadge = action.payload;
    },
    setUserRole(state, action) {
      state.role = action.payload; // Explicit action to set role
    },
    setCreated(state, action) {
      state.created = action.payload; // Explicit action to set role
    },
    clearUserData(state) {
      state.userData = {};
      state.location = {};
      state.unseenBadge = {};
      state.role = null; // Reset role on logout
      state.created = false;
    },
  },
});

export const {
  setUserData,
  setLocation,
  setUnseenBadge,
  setUserRole,
  setCreated,
  clearUserData,
} = usersSlice.actions;

export default usersSlice.reducer;
