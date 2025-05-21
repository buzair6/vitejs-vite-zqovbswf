import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import SignUp from './components/SignUp';
import Login from './components/Login';

function App() {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/signup">Sign Up</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
        </ul>
      </nav>
      <hr />
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        {/* Optional: Default route, e.g., redirecting to login or a home page */}
        {/* For now, navigating to /login or /signup directly will show the components */}
      </Routes>
    </div>
  );
}

export default App;
