import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import api from '../services/api';

function ShoppingList() {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadShoppingList();
  }, []);

  const loadShoppingList = async () => {
    // Получаем текущее меню и его список покупок
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const weekStart = monday.toISOString().split('T')[0];

    try {
      // Сначала получаем меню
      const menuRes = await api.get(`/menu/week?week_start=${weekStart}`);
      if (menuRes.data && menuRes.data.id) {
        // Получаем список покупок
        const listRes = await api.get(`/shopping-list?weekly_menu_id=${menuRes.data.id}`);
        setList(listRes.data);
      } else {
        setError('Сначала создайте меню на неделю');
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Сначала создайте меню на неделю');
      } else {
        setError('Ошибка загрузки списка покупок');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (itemIndex) => {
    if (!list) return;

    try {
      const updatedItems = [...list.items];
      updatedItems[itemIndex].is_checked = !updatedItems[itemIndex].is_checked;

      await api.post('/shopping-list/check-item', {
        shopping_list_id: list.id,
        item_index: itemIndex,
        is_checked: updatedItems[itemIndex].is_checked,
      });

      setList({ ...list, items: updatedItems });
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const generateList = async () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const weekStart = monday.toISOString().split('T')[0];

    try {
      const menuRes = await api.get(`/menu/week?week_start=${weekStart}`);
      if (menuRes.data && menuRes.data.id) {
        const listRes = await api.get(`/shopping-list?weekly_menu_id=${menuRes.data.id}`);
        setList(listRes.data);
      }
    } catch (error) {
      console.error('Error generating list:', error);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !list) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">
            {error}
          </Alert>
          <Button
            variant="contained"
            onClick={() => window.location.href = '/menu'}
            sx={{ mt: 2 }}
          >
            Перейти к меню
          </Button>
        </Box>
      </Container>
    );
  }

  if (!list || !list.items || list.items.length === 0) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">
            Список покупок пуст. Создайте меню на неделю, чтобы сгенерировать список.
          </Alert>
          <Button
            variant="contained"
            onClick={generateList}
            sx={{ mt: 2 }}
          >
            Обновить список
          </Button>
        </Box>
      </Container>
    );
  }

  // Группируем по категориям
  const grouped = {};
  list.items.forEach((item) => {
    const category = item.category || 'Другое';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Список покупок
          </Typography>

          {Object.entries(grouped).map(([category, items]) => (
            <Box key={category} sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                {category}
              </Typography>
              <List>
                {items.map((item, index) => {
                  const globalIndex = list.items.findIndex(i => i === item);
                  return (
                    <ListItem
                      key={globalIndex}
                      secondaryAction={
                        <Checkbox
                          edge="end"
                          checked={item.is_checked || false}
                          onChange={() => handleToggle(globalIndex)}
                        />
                      }
                    >
                      <ListItemText
                        primary={item.product_name}
                        secondary={`${item.amount} ${item.unit}`}
                        sx={{
                          textDecoration: item.is_checked ? 'line-through' : 'none',
                          opacity: item.is_checked ? 0.5 : 1,
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))}
        </Paper>
      </Box>
    </Container>
  );
}

export default ShoppingList;

