import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import the hook

const Home = () => {
  const navigate = useNavigate(); // 2. Initialize the hook

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Welcome to Smart University 🎓</h1>
      <p>Manage your courses and students efficiently.</p>
      
      {/* 3. Add onClick events to the buttons */}
      <button 
        onClick={() => navigate('/login')} 
        style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
      >
        Login
      </button>
      
      <button 
        onClick={() => navigate('/register')} 
        style={{ padding: '10px 20px', marginLeft: '10px', cursor: 'pointer' }}
      >
        Register
      </button>
    </div>
  );
};

export default Home;