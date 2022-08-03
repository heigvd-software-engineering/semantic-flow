import React from 'react';
import Navigation from './main/navigation/Navigation';
import Main from './main/Main';
import ViewMode from './main/ViewMode';
import { MainProvider } from './context/MainContext';
import './assets/css/main.css';

function App() {
  return (
    <MainProvider>
      <div className="App">
        <header className="toolbar">
            <Navigation />
            <ViewMode />
        </header>
        <main>
          <Main />
        </main>
      </div>
    </MainProvider>
  );
}

export default App;
