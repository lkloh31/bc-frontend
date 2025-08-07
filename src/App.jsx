import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router';
import Homepage from './components/Homepage';
import Register from './components/Register';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <header>
        <h1>MEV</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/register">Register</Link>
          <Link to="/login">Login</Link>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;

