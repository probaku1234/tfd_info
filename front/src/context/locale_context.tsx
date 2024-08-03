// src/context/LocaleContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  FC,
} from "react";

interface LocaleContextType {
  locale: string;
  setLocale: React.Dispatch<React.SetStateAction<string>>;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider: FC<LocaleProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<string>("en");

  useEffect(() => {
    const userLanguage = navigator.language;
    const userLocale = userLanguage.startsWith("ko") ? "ko" : "en";
    setLocale(userLocale);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
};

export default LocaleContext;
