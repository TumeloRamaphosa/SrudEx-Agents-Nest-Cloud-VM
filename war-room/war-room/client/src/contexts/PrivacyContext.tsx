import { createContext, useContext, useState } from "react";

interface PrivacyContextType {
  isPrivate: boolean;
  togglePrivacy: () => void;
  mask: (value: string | number) => string;
}

const PrivacyContext = createContext<PrivacyContextType>({
  isPrivate: false,
  togglePrivacy: () => {},
  mask: (v) => String(v),
});

export function PrivacyProvider({ children }: { children: React.ReactNode }) {
  const [isPrivate, setIsPrivate] = useState(false);

  const togglePrivacy = () => setIsPrivate((p) => !p);

  const mask = (value: string | number) => {
    if (isPrivate) return "••••••";
    return String(value);
  };

  return (
    <PrivacyContext.Provider value={{ isPrivate, togglePrivacy, mask }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy() {
  return useContext(PrivacyContext);
}
