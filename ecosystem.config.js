module.exports = {
  apps: [{
    name: 'FMovies - Movie Recommendation App',
    script: 'app.js',
    watch: true,
    ignore_watch: ['logs/server.log', 'node_modules', 'logs', 'python_backend'],
    time: true,
    // error_file: '/var/log/fmovies/fmovies_error.log',
    // out_file: '/var/log/fmovies/fmovies_app.log',
    env_television: {
      NODE_ENV: 'tv',
      API_ENDPOINT: 'api.themoviedb.org',
    },
    env_movie: {
      NODE_ENV: 'movie',
      API_ENDPOINT: 'api.themoviedb.org',
    },
  }],
};
