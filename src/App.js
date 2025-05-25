import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TopicSearchPage from './pages/TopicSearchPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* 루트 경로로 접근했을 때 /topic-search로 리디렉션 */}
        <Route path="/" element={<Navigate to="/topic-search" replace />} />
        <Route path="/topic-search" element={<TopicSearchPage />} />
      </Routes>
    </Router>
  );
}

export default App;
