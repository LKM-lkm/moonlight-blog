const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: './src/index.js',
    admin: './admin/assets/js/admin.js',
    theme: './assets/js/theme.js',
    chatbot: './assets/js/chatbot.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].js',
    clean: true,
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash][ext]'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash].css'
    }),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      chunks: ['main', 'theme', 'chatbot']
    }),
    new HtmlWebpackPlugin({
      template: './admin/views/login.html',
      filename: 'admin/login/index.html',
      chunks: ['admin', 'theme']
    }),
    new HtmlWebpackPlugin({
      template: './admin/views/dashboard.html',
      filename: 'admin/dashboard/index.html',
      chunks: ['admin', 'theme']
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'assets/images',
          to: 'images'
        },
        {
          from: 'assets/fonts',
          to: 'fonts'
        },
        {
          from: 'admin/api',
          to: 'admin/api'
        }
      ]
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'vendors'
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 9000,
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/admin/api': {
        target: 'http://localhost:80',
        changeOrigin: true
      }
    }
  },
  resolve: {
    extensions: ['.js', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@admin': path.resolve(__dirname, 'admin'),
      '@assets': path.resolve(__dirname, 'assets')
    }
  }
}; 