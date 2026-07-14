import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <LanguageProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </LanguageProvider>
  </BrowserRouter>
);

export default App;
