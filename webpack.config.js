const path = require('path');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './src/frontend/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new Dotenv({
      path: './config/.env', 
      safe: false,
      systemvars: true,
      silent: false
    })
  ]
};