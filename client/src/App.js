import './App.css';
import Search from './Search.js';
import React, {useState} from 'react';

function App() {
  const [flights, setFlights] = React.useState({});

  function newResults(results) {
    setFlights(results);
  }


  return (
    <div className="App">
      <Search updateResults={newResults}></Search>
    </div>
  );
}

export default App;
