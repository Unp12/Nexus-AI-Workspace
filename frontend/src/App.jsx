import { useState } from 'react'; // Removed unused React and useEffectimport Login from './components/Login';
import Dashboard from './components/Dashboard'; // We'll build this next
import Login from './components/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // If no token exists, show Login. If it exists, show Dashboard.
  return (
    <div className="App">
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <Dashboard token={token} setToken={setToken} />
      )}
    </div>
  );
}

export default App;