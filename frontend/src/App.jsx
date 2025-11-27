import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🥗 ЕмПоСезону
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* TODO: Добавить остальные маршруты */}
        </Routes>
      </Container>
    </ThemeProvider>
  );
}

function HomePage() {
  return (
    <div>
      <Typography variant="h3" component="h1" gutterBottom>
        Добро пожаловать в ЕмПоСезону!
      </Typography>
      <Typography variant="body1" paragraph>
        Приложение для планирования питания с учетом сезонности, акций и остатков в холодильнике.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        MVP в разработке...
      </Typography>
    </div>
  );
}

export default App;

