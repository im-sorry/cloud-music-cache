import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import Cache from './pages/cache';
import Donation from './pages/donation';
import GameHall from './pages/games';
import Puzzle from './pages/games/puzzle';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route path="cache" element={<Cache />} />
          <Route path="donation" element={<Donation />} />
          <Route path="gamehall" element={<GameHall />} />
          <Route path="puzzle" element={<Puzzle />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
