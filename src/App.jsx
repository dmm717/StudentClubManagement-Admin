import { BrowserRouter as Router } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import './App.css';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ConfigProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppRoutes />
      </Router>
    </ConfigProvider>
  );
}

export default App;
