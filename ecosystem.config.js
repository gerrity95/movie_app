module.exports = {
    apps : [{
      name: "FMovies - Movie Recommendation App",
      script: 'app.js',
      watch: true,
      time: true,
      error_file: '/var/log/fmovies/fmovies_error.log',
      out_file: '/var/log/fmovies/fmovies_app.log',
    }]
  };