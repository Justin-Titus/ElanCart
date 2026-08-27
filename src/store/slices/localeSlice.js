import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lang: 'en',
  currency: 'INR'
};

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLang: (state, action) => {
      state.lang = action.payload;
    },
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
    setLocale: (state, action) => {
      return { ...state, ...action.payload };
    }
  }
});

export const { setLang, setCurrency, setLocale } = localeSlice.actions;

// Selectors
export const selectLang = (state) => state.locale.lang;
export const selectCurrency = (state) => state.locale.currency;
export const selectLocale = (state) => state.locale;

export default localeSlice.reducer;
