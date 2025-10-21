// Serverless function wrapper para Vercel
const app = require('../backend/dist/index').default || require('../backend/dist/index');

module.exports = app;
