import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import api from '../services/api';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await api.put('/profile', profile);
      setMessage('Профиль успешно обновлен');
    } catch (error) {
      setMessage('Ошибка обновления профиля');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Container><Typography>Загрузка...</Typography></Container>;
  }

  if (!profile) {
    return <Container><Typography>Профиль не найден</Typography></Container>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Профиль питания
          </Typography>

          {message && (
            <Alert severity={message.includes('успешно') ? 'success' : 'error'} sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Размер семьи"
                  type="number"
                  value={profile.family_size || 1}
                  onChange={(e) => handleChange('family_size', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 10 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Стиль кухни</InputLabel>
                  <Select
                    value={profile.cuisine_style || 'russian'}
                    onChange={(e) => handleChange('cuisine_style', e.target.value)}
                  >
                    <MenuItem value="russian">Русская</MenuItem>
                    <MenuItem value="european">Европейская</MenuItem>
                    <MenuItem value="asian">Азиатская</MenuItem>
                    <MenuItem value="mediterranean">Средиземноморская</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Время приготовления</InputLabel>
                  <Select
                    value={profile.cooking_time || 'medium'}
                    onChange={(e) => handleChange('cooking_time', e.target.value)}
                  >
                    <MenuItem value="quick">До 15 минут</MenuItem>
                    <MenuItem value="medium">До 30 минут</MenuItem>
                    <MenuItem value="long">Более 30 минут</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Бюджет на неделю (₽)"
                  type="number"
                  value={profile.budget_per_week || 3000}
                  onChange={(e) => handleChange('budget_per_week', parseFloat(e.target.value))}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Цели питания
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {['healthy', 'weight_loss', 'maintenance', 'muscle_gain'].map((goal) => (
                    <Chip
                      key={goal}
                      label={goal === 'healthy' ? 'Здоровое питание' : 
                             goal === 'weight_loss' ? 'Снижение веса' :
                             goal === 'maintenance' ? 'Поддержание веса' : 'Набор массы'}
                      color={profile.goals?.includes(goal) ? 'primary' : 'default'}
                      onClick={() => {
                        const goals = profile.goals || [];
                        const newGoals = goals.includes(goal)
                          ? goals.filter(g => g !== goal)
                          : [...goals, goal];
                        handleChange('goals', newGoals);
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Аллергии (через запятую)"
                  value={Array.isArray(profile.allergies) ? profile.allergies.join(', ') : ''}
                  onChange={(e) => handleChange('allergies', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                  placeholder="орехи, молоко, яйца"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Нелюбимые продукты (через запятую)"
                  value={Array.isArray(profile.dislikes) ? profile.dislikes.join(', ') : ''}
                  onChange={(e) => handleChange('dislikes', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                  placeholder="лук, сельдерей"
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={saving}
                  fullWidth
                >
                  {saving ? 'Сохранение...' : 'Сохранить профиль'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default Profile;

