import { useState, useEffect } from "react";
import Login from "./Login";
import WebPlayback from "./WebPlayback";

function App() {
  const [token, setToken] = useState('');

  useEffect(() => {

    async function getToken() {
      const response = await fetch('/api/v1/auth/token');
      const json = await response.json();
      setToken(json.access_token);
    }

    getToken();

  }, []);

  return (
    <>
        { (token === '') ? <Login/> : <WebPlayback token={token} /> }
    </>
  );
}

export default App
