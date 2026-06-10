const authRoutes = require('./authRoutes');
const songRoutes = require('./songRoutes');
const userRoutes = require('./userRoutes');
const playlistRoutes = require('./playlistRoutes');
const searchRoutes = require('./searchRoutes');
const homeController = require('../controllers/homeController');

function route(app) {
    // Auth Routes (login, register, logout)
    app.use('/', authRoutes);

    // Home Page
    app.get('/', homeController.index);
    app.get('/home', (req, res) => res.redirect('/'));

    // Songs & Streaming
    app.use('/songs', songRoutes);
    // Legacy support for reference client player scripts calling '/music'
    app.use('/music', songRoutes);

    // Playlists
    app.use('/playlists', playlistRoutes);

    // Search
    app.use('/search', searchRoutes);

    // User Profile, Favorites, History, Follows
    app.use('/', userRoutes);
}

module.exports = route;
