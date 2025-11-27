import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';
import api from '../services/api';

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
const MEALS = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
};

function Menu() {
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday;
  });
  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const loadMenu = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/menu/week?week_start=${formatDate(weekStart)}`);
      setMenu(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setMenu(null);
      } else {
        setError('Ошибка загрузки меню');
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMenu = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/menu/generate', {
        week_start: formatDate(weekStart),
        use_pantry: true,
        consider_seasonal: true,
      });
      setMenu(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка генерации меню');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenu();
  }, [weekStart]);

  return (
    <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1">
                Недельное меню
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  label="Начало недели"
                  type="date"
                  value={formatDate(weekStart)}
                  onChange={(e) => setWeekStart(new Date(e.target.value))}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  variant="contained"
                  onClick={generateMenu}
                  disabled={loading}
                >
                  {menu ? 'Перегенерировать' : 'Сгенерировать меню'}
                </Button>
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading && !menu && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {!loading && !menu && (
              <Alert severity="info">
                Меню на эту неделю еще не создано. Нажмите "Сгенерировать меню" для создания.
              </Alert>
            )}

            {menu && (
              <Grid container spacing={2}>
                {menu.days?.map((day, index) => (
                  <Grid item xs={12} md={6} lg={4} key={index}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {DAYS[index]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {day.date}
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                          {Object.entries(MEALS).map(([key, label]) => (
                            <Box key={key} sx={{ mb: 1 }}>
                              <Typography variant="subtitle2" color="primary">
                                {label}:
                              </Typography>
                              {day.meals[key] ? (
                                <Typography variant="body2">
                                  {day.meals[key].recipe_name}
                                  {day.meals[key].cooking_time && (
                                    <span style={{ color: '#666', fontSize: '0.85em' }}>
                                      {' '}({day.meals[key].cooking_time} мин)
                                    </span>
                                  )}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Не выбрано
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Box>
      </Container>
  );
}

export default Menu;

