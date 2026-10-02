import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("Backend'e bağlanılıyor...");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.error(error);
        setMessage("Backend bağlantısı başarısız.");
      });
  }, []);

  return (
    <div>
      <h1>DataPilot</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;