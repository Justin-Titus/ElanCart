import React from 'react';

const STORAGE_KEY = 'ecommerce-locale';

const defaultState = {
  lang: 'en',
  currency: 'INR'
};

const LocaleContext = React.createContext({
  ...defaultState,
  setLang: () => {},
  setCurrency: () => {}
});

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = React.useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      // ignore malformed storage
  console.debug('LocaleContext: failed to read storage', err?.message || err);
    }
    return defaultState;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locale));
    } catch (err) {
      // ignore storage failures (quota, private mode)
  console.debug('LocaleContext: failed to write storage', err?.message || err);
    }
  }, [locale]);

  const setLang = (lang) => setLocale(l => ({ ...l, lang }));
  const setCurrency = (currency) => setLocale(l => ({ ...l, currency }));

  return (
    <LocaleContext.Provider value={{ ...locale, setLang, setCurrency }}>
      {children}
    </LocaleContext.Provider>
  );
};

export default LocaleContext;
