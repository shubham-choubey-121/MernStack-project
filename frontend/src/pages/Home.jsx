import { useState } from 'react';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import ProductList from '../components/ProductList';
import ImageGallery from '../components/ImageGallery';
import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showSignup, setShowSignup] = useState(false);

  const handleLoginSuccess = () => setIsLoggedIn(true);
  const handleSignupSuccess = () => setIsLoggedIn(true);

  if (!isLoggedIn) {
    return showSignup ? (
      <SignupForm onSignupSuccess={handleSignupSuccess} onShowLogin={() => setShowSignup(false)} />
    ) : (
      <LoginForm onLoginSuccess={handleLoginSuccess} onShowSignup={() => setShowSignup(true)} />
    );
  }

  return (
    <div>
      <header className="app-header" style={{ marginBottom: '1rem' }}>
        <div className="brand">
          <div className="logo" />
          <div>
            <h1 style={{ margin: 0 }}>MERN Demo</h1>
            <div className="muted">Simple project dashboard</div>
          </div>
        </div>

        <div>
          <button
            className="ghost"
            onClick={() => {
              localStorage.removeItem('token');
              setIsLoggedIn(false);
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="main-grid">
        <aside className="sidebar surface">
          <div className="card">
            <h2>Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.5rem' }}>
              <button className="primary">New Task</button>
              <button className="ghost">Upload Image</button>
            </div>
          </div>
        </aside>

        <main className="content">
          <section className="tasks-section surface" style={{ marginBottom: '1rem' }}>
            <div className="section-title">
              <h2 style={{ margin: 0 }}>Task Management</h2>
            </div>
            <TaskForm />
            <TaskList />
          </section>

          <section className="products-section surface" style={{ marginBottom: '1rem' }}>
            <div className="section-title">
              <h2 style={{ margin: 0 }}>Products</h2>
            </div>
            <ProductList />
          </section>

          <section className="gallery-section surface">
            <div className="section-title">
              <h2 style={{ margin: 0 }}>Image Gallery</h2>
            </div>
            <ImageGallery />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Home;