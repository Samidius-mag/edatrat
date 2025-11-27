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
  Checkbox,
  FormControlLabel,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import api from '../services/api';

function Pantry() {
  const [products, setProducts] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [quantities, setQuantities] = useState({});
  const [units, setUnits] = useState({});
  const [expiryDates, setExpiryDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, pantryRes] = await Promise.all([
        api.get('/products').catch(() => ({ data: { products: [] } })),
        api.get('/pantry').catch(() => ({ data: { items: [] } })),
      ]);

      const productsList = productsRes.data.products || [];
      setProducts(productsList);

      const items = pantryRes.data.items || [];
      setPantryItems(items);

      // Заполняем форму данными из холодильника
      const selected = {};
      const qty = {};
      const unit = {};
      const expiry = {};

      items.forEach((item) => {
        selected[item.product_id] = true;
        qty[item.product_id] = item.amount || '';
        unit[item.product_id] = item.unit || 'кг';
        expiry[item.product_id] = item.expiry_date || '';
      });

      setSelectedProducts(selected);
      setQuantities(qty);
      setUnits(unit);
      setExpiryDates(expiry);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (productId) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));

    // Если снимаем галочку, очищаем данные
    if (selectedProducts[productId]) {
      setQuantities((prev) => {
        const newQty = { ...prev };
        delete newQty[productId];
        return newQty;
      });
      setUnits((prev) => {
        const newUnits = { ...prev };
        delete newUnits[productId];
        return newUnits;
      });
      setExpiryDates((prev) => {
        const newExpiry = { ...prev };
        delete newExpiry[productId];
        return newExpiry;
      });
    } else {
      // Если ставим галочку, устанавливаем значения по умолчанию
      const product = products.find((p) => p.id === productId);
      if (product) {
        setUnits((prev) => ({
          ...prev,
          [productId]: product.unit || 'кг',
        }));
      }
    }
  };

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleUnitChange = (productId, value) => {
    setUnits((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleExpiryChange = (productId, value) => {
    setExpiryDates((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      // Получаем текущие элементы холодильника
      const currentItems = await api.get('/pantry').then((res) => res.data.items || []);

      // Создаем список для сохранения
      const itemsToSave = Object.keys(selectedProducts)
        .filter((productId) => selectedProducts[productId])
        .map((productId) => ({
          product_id: parseInt(productId),
          amount: parseFloat(quantities[productId]) || 0,
          unit: units[productId] || 'кг',
          expiry_date: expiryDates[productId] || null,
        }));

      // Удаляем элементы, которые были сняты
      const itemsToDelete = currentItems.filter(
        (item) => !selectedProducts[item.product_id]
      );

      // Удаляем старые элементы
      for (const item of itemsToDelete) {
        try {
          await api.delete(`/pantry/${item.id}`);
        } catch (error) {
          console.error('Error deleting item:', error);
        }
      }

      // Обновляем или создаем новые элементы
      for (const item of itemsToSave) {
        const existingItem = currentItems.find((i) => i.product_id === item.product_id);
        
        if (existingItem) {
          // Обновляем существующий
          await api.put(`/pantry/${existingItem.id}`, item);
        } else {
          // Создаем новый
          await api.post('/pantry', item);
        }
      }

      setMessage('Холодильник успешно обновлен!');
      await loadData();
      
      // Очищаем сообщение через 3 секунды
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving pantry:', error);
      setMessage('Ошибка сохранения. Попробуйте еще раз.');
    } finally {
      setSaving(false);
    }
  };

  // Группируем продукты по категориям
  const groupedProducts = {};
  products.forEach((product) => {
    const category = product.category || 'Другое';
    if (!groupedProducts[category]) {
      groupedProducts[category] = [];
    }
    groupedProducts[category].push(product);
  });

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Холодильник
            </Typography>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
              size="large"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </Box>

          {message && (
            <Alert
              severity={message.includes('успешно') ? 'success' : 'error'}
              sx={{ mb: 3 }}
              onClose={() => setMessage('')}
            >
              {message}
            </Alert>
          )}

          <Typography variant="body1" color="text.secondary" paragraph>
            Отметьте продукты, которые у вас есть, укажите количество и срок годности.
          </Typography>

          {Object.keys(groupedProducts).length === 0 ? (
            <Alert severity="info">
              Продукты не загружены. Проверьте подключение к серверу.
            </Alert>
          ) : (
            <Box>
              {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                <Box key={category} sx={{ mb: 4 }}>
                  <Typography variant="h5" gutterBottom sx={{ mb: 2, color: 'primary.main' }}>
                    {category}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {categoryProducts.map((product) => (
                      <Grid item xs={12} sm={6} md={4} key={product.id}>
                        <Card
                          variant="outlined"
                          sx={{
                            height: '100%',
                            border: selectedProducts[product.id]
                              ? '2px solid'
                              : '1px solid',
                            borderColor: selectedProducts[product.id]
                              ? 'primary.main'
                              : 'divider',
                          }}
                        >
                          <CardContent>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedProducts[product.id] || false}
                                  onChange={() => handleToggle(product.id)}
                                />
                              }
                              label={
                                <Typography variant="h6" component="div">
                                  {product.name}
                                </Typography>
                              }
                              sx={{ mb: 2, width: '100%' }}
                            />

                            {selectedProducts[product.id] && (
                              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  <TextField
                                    label="Количество"
                                    type="number"
                                    value={quantities[product.id] || ''}
                                    onChange={(e) =>
                                      handleQuantityChange(product.id, e.target.value)
                                    }
                                    size="small"
                                    fullWidth
                                    inputProps={{ min: 0, step: 0.1 }}
                                  />
                                  <FormControl size="small" sx={{ minWidth: 100 }}>
                                    <InputLabel>Единица</InputLabel>
                                    <Select
                                      value={units[product.id] || product.unit || 'кг'}
                                      onChange={(e) =>
                                        handleUnitChange(product.id, e.target.value)
                                      }
                                      label="Единица"
                                    >
                                      <MenuItem value="кг">кг</MenuItem>
                                      <MenuItem value="г">г</MenuItem>
                                      <MenuItem value="л">л</MenuItem>
                                      <MenuItem value="мл">мл</MenuItem>
                                      <MenuItem value="шт">шт</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Box>
                                <TextField
                                  label="Срок годности"
                                  type="date"
                                  value={expiryDates[product.id] || ''}
                                  onChange={(e) =>
                                    handleExpiryChange(product.id, e.target.value)
                                  }
                                  size="small"
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                />
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={saving}
              size="large"
            >
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Pantry;
