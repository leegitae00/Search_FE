import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TopicSearchPage from './pages/TopicSearchPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/topic-search" element={<TopicSearchPage />} />
      </Routes>
    </Router>
  );
}

export default App;
