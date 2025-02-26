import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CssBaseline, Container } from '@mui/material';
import Login from './components/Login';
import FeedbackList from './components/FeedbackList';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CssBaseline />
      <Router>
        <Navigation />
        <Container maxWidth="md">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/feedbacks" 
              element={
                <ProtectedRoute>
                  <FeedbackList />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/feedbacks" replace />} />
          </Routes>
        </Container>
      </Router>
    </AuthProvider>
  );
}

export default App;