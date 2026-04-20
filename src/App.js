import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FirstPage from './firstpage';
import VoterHome from './voterHome';
import CandidateHome from "./candidateHome";
import ProtectedRoute from "./ProtectedRoute";
import UserProfilePage from "./pages/UserProfilePage";
import SettingsPage from "./pages/SettingsPage";
import HelpPage from "./pages/HelpPage";
import OfficialProfilePage from "./pages/OfficialProfilePage";
import RegisterCandidatePage from "./pages/RegisterCandidatePage";
import CandidateMyProfilePage from "./pages/CandidateMyProfilePage";
import ProfileViewPage from "./pages/ProfileViewPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FirstPage />} />
        <Route
          path="/voter/home"
          element={
            <ProtectedRoute requiredRole="voter">
              <VoterHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/home"
          element={
            <ProtectedRoute requiredRole="candidate">
              <CandidateHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/voter/profile"
          element={
            <ProtectedRoute requiredRole="voter">
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/voter/officials/:officialId"
          element={
            <ProtectedRoute requiredRole="voter">
              <OfficialProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/officials/:officialId"
          element={
            <ProtectedRoute requiredRole="voter">
              <OfficialProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/profile"
          element={
            <ProtectedRoute requiredRole="candidate">
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-profile"
          element={
            <ProtectedRoute requiredRole="candidate">
              <CandidateMyProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register-candidate"
          element={
            <ProtectedRoute requiredRole="voter">
              <RegisterCandidatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/view/:id"
          element={
            <ProtectedRoute requiredRole="candidate">
              <ProfileViewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <HelpPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;