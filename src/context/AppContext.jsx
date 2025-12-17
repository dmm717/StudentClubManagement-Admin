import { createContext, useContext, useState } from 'react';

// Context đơn giản để chuẩn bị cho việc chia sẻ state toàn cục (giống AppContext của SWP-391)
// Hiện tại chỉ dùng như scaffold, không tác động tới luồng logic đang có.

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Có thể thêm các state/global config tại đây trong tương lai
  const [state] = useState({});

  return <AppContext.Provider value={state}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);


