import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskList from '../components/TaskList';
import ProductList from '../components/ProductList';
import ImageGallery from '../components/ImageGallery';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // You could fetch user data here using the token
    // For now, we'll just check if token exists
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <h1>Welcome {user?.name || 'User'}</h1>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <div className="dashboard-content">
        <section className="tasks-section">
          <h2>My Tasks</h2>
          <TaskList />
        </section>

        <section className="products-section">
          <h2>Products</h2>
          <ProductList />
        </section>

        <section className="gallery-section">
          <h2>Image Gallery</h2>
          <ImageGallery />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;