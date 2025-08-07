import { createContext, useContext, useState } from "react";

const PageContext = createContext();

export function PageProvider({ children }) {
  const [page, setPage] = useState("home");
  const [pageData, setPageData] = useState(null);
  const value = { page, setPage, pageData, setPageData };
  return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export function usePage() {
  const context = useContext(PageContext);
  if (!context) throw Error("usePage must be used within PageProvider");
  return context;
}
