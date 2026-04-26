import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = ({ children }) => (
  <div className="app-shell">
    <Sidebar />
    <div className="app-main">
      <TopBar />
      <div className="app-content">
        {children}
      </div>
    </div>
  </div>
);

export default Layout;
