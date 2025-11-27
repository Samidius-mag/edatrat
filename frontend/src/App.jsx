import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { authService } from './services/auth';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Menu from './pages/Menu';
import Pantry from './pages/Pantry';
import ShoppingList from './pages/ShoppingList';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e7d32', // Зеленый цвет (сезонность, природа)
    },
    secondary: {
      main: '#f57c00', // Оранжевый (овощи, фрукты)
    },
  },
});

function Navigation() {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          🥗 ЕмПоСезону
        </Typography>
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} to="/menu">
              Меню
            </Button>
            <Button color="inherit" component={Link} to="/pantry">
              Холодильник
            </Button>
            <Button color="inherit" component={Link} to="/shopping-list">
              Список покупок
            </Button>
            <Button color="inherit" component={Link} to="/profile">
              Профиль
            </Button>
            <Button color="inherit" onClick={handleLogout}>
              Выход
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button color="inherit" component={Link} to="/login">
              Вход
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Регистрация
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

function HomePage() {
  const isAuthenticated = authService.isAuthenticated();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Добро пожаловать в ЕмПоСезону!
        </Typography>
        <Typography variant="body1" paragraph>
          Приложение для планирования питания с учетом сезонности, акций и остатков в холодильнике.
        </Typography>
        {!isAuthenticated && (
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" component={Link} to="/register" size="large">
              Начать
            </Button>
            <Button variant="outlined" component={Link} to="/login" size="large">
              Войти
            </Button>
          </Box>
        )}
        {isAuthenticated && (
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" component={Link} to="/menu" size="large">
              Создать меню
            </Button>
            <Button variant="outlined" component={Link} to="/pantry" size="large">
              Мой холодильник
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/menu"
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pantry"
          element={
            <ProtectedRoute>
              <Pantry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shopping-list"
          element={
            <ProtectedRoute>
              <ShoppingList />
            </ProtectedRoute>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

