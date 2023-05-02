import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Events from './components/Events';
import Event from './components/Event';
import Header from './components/Header';

function createDB(name) {
  const dbName = name;
  const storeName = name;
  const version = 1;

  const request = indexedDB.open(dbName, version);

  request.onupgradeneeded = (event) => {
    const db = event.target.result;
    const store = db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });

    // adicione aqui as configurações do objeto store, como índices, etc.

    console.log("Banco de dados criado com sucesso");
  };

  request.onsuccess = (event) => {
    const db = event.target.result;
    console.log("Conexão com o banco de dados bem-sucedida");

    // faça aqui as operações que precisam ser feitas com o banco de dados
  };

  request.onerror = (event) => {
    console.log(`Erro ao abrir o banco de dados: ${event.target.error}`);
  };
}

createDB("users");
createDB("event_user")

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path='/event/:id' element={<Event />} />
      </Routes>
    </Router>
  );
}

export default App;
