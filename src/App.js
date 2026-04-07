import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FirstPage from './firstpage';
import VoterHome from './voterHome';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FirstPage />} />
        <Route path="/voter/home" element={<VoterHome />} />
      </Routes>
    </Router>
  );
}

export default App;