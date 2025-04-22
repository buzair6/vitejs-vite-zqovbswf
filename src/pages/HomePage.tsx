// src/pages/HomePage.tsx
// No changes needed from the previous version. Keep the exact same file content.
import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="home-page-container">
      <section className="hero-section">
         <h1>Welcome to EngroMaint</h1>
         <p> Your simple solution for managing Assets and Work Orders efficiently. Keep track of maintenance tasks and asset health in one place.</p>
         <div>
           <Link to="/workorders" className="button-link">View Work Orders</Link>
           <Link to="/assets" className="button-link">Manage Assets</Link>
           <Link to="/tools" className="button-link">Book Tools</Link>
           <Link to="/chat" className="button-link">Team Chat</Link>
         </div>
      </section>
      <section className="features-section">
        <h2>Core Features</h2>
        <div className="feature-grid">
          <div className="feature-card"><h3>Work Order Management</h3><p>Create, track, and manage maintenance work orders from request to completion.</p></div>
          <div className="feature-card"><h3>Asset Tracking</h3><p>Maintain a central repository of your assets, including location and status.</p></div>
          <div className="feature-card"><h3>Tool Booking</h3><p>Reserve shared tools like forklifts or cranes, manage requests and approvals.</p></div>
          <div className="feature-card"><h3>Team Chat</h3><p>Communicate with maintenance teams and supervisors directly within the app.</p></div>
        </div>
      </section>
      <p className="home-note"><strong>Note:</strong> Data is stored locally in your browser using LocalStorage.</p>
    </div>
  );
}
export default HomePage;