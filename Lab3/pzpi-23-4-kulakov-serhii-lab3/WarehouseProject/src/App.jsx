import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { ThemeProvider, LanguageProvider, RegionProvider } from './context/AppContext';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import WarehousePage from './pages/WarehousePage';
import SearchPage from './pages/SearchPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';
import CreateAdvertPage from './pages/CreateAdvertPage';
import ComparePage from './pages/ComparePage';
import SupportPage from './pages/SupportPage';
import EditPage from './pages/EditPage';
import AdminPanel from './pages/AdminPanel';
import AdminAdverts from './pages/AdminAdverts';
import AdminChats from './pages/AdminChats';
import PrivateRoute from './components/PrivateRoute';
import SupportChatPage from './pages/SupportChatPage';
import AdminUsers from './pages/AdminUsers';
import AdminStatistics from './pages/AdminStatistic';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <RegionProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/warehouse/:id" element={<WarehousePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/admin" element={
                <PrivateRoute><AdminPanel /></PrivateRoute>
              } />
              <Route path="/admin/chats" element={
                <PrivateRoute><AdminChats /></PrivateRoute>
              } />
              <Route path="/admin/adverts" element={
                <PrivateRoute><AdminAdverts /></PrivateRoute>
              } />
              <Route path="/favorites" element={
                <PrivateRoute><FavoritesPage /></PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute><ProfilePage /></PrivateRoute>
              } />
              <Route path="/create-advert" element={
                <PrivateRoute><CreateAdvertPage /></PrivateRoute>
              } />
              <Route path="/edit-page/:advertId" element={
                <PrivateRoute><EditPage /></PrivateRoute>
              } />
              <Route path="/compare" element={
                <PrivateRoute><ComparePage /></PrivateRoute>
              } />
              <Route path="/support" element={
                <PrivateRoute><SupportPage /></PrivateRoute>
              } />
              <Route path="/support/chat/:ticketId" element={
                <PrivateRoute><SupportChatPage /></PrivateRoute>
              } />
              <Route path="/support/:ticketId" element={
                <PrivateRoute><SupportChatPage /></PrivateRoute>
              } />
              <Route path="/admin/users" element={
                  <PrivateRoute><AdminUsers /></PrivateRoute>
              } />
              <Route path="/admin/statistics" element={
                  <PrivateRoute><AdminStatistics /></PrivateRoute>
              } />
            </Routes>
          </Router>
        </RegionProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;