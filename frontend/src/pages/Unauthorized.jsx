import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <h2>🚫 Access Denied</h2>
      <p>You don't have permission to view this page.</p>
      <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
};

export default Unauthorized;
