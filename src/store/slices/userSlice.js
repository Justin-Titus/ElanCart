import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loading: true
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setUserLoaded: (state) => {
      state.loading = false;
    }
  }
});

export const { login, logout, updateUser, setUserLoaded } = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.user;
export const selectUserLoading = (state) => state.user.loading;
export const selectIsAuthenticated = (state) => !!state.user.user;

export default userSlice.reducer;
