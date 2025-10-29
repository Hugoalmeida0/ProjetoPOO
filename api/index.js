// Serverless function wrapper para Vercel
require('dotenv').config({ path: '../backend/.env' });

const express = require('../backend/dist/index').default || require('../backend/dist/index');

module.exports = express;
