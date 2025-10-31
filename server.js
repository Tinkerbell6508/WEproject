const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve public files at /public
app.use('/public', express.static(path.join(__dirname, 'public')));

// Mongoose model
const Recipe = require('./models/Recipe');

// Connect to MongoDB Atlas
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('ERROR: MONGODB_URI environment variable not set. See .env.example');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB Atlas');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// API Routes for CRUD
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const { title, ingredients, instructions, imageURL } = req.body;
    // ingredients can be sent as newline-separated string or array
    let ing = [];
    if (Array.isArray(ingredients)) ing = ingredients;
    else if (typeof ingredients === 'string') {
      ing = ingredients.split('\n').map(s => s.trim()).filter(Boolean);
    }

    const recipe = new Recipe({ title, ingredients: ing, instructions, imageURL });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  try {
    const { title, ingredients, instructions, imageURL } = req.body;
    let ing = [];
    if (Array.isArray(ingredients)) ing = ingredients;
    else if (typeof ingredients === 'string') {
      ing = ingredients.split('\n').map(s => s.trim()).filter(Boolean);
    }
    const updated = await Recipe.findByIdAndUpdate(req.params.id, {
      title, ingredients: ing, instructions, imageURL
    }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Recipe not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const deleted = await Recipe.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Recipe not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Serve static HTML pages from views
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'view.html'));
});
app.get('/add', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'add.html'));
});
app.get('/edit', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'edit.html'));
});
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'about.html'));
});
app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});
app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'feedback.html'));
});

// Fallback
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
