const corsConfig = {
  origin: 'http://127.0.0.1:3000',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204
};

module.exports = { corsConfig };
