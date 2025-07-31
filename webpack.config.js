const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    main: './src/index.js',
    admin: './admin/assets/js/admin.js',
    login: './admin/login.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].js',
    clean: true,
    publicPath: ''
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name].[hash][ext]'
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash][ext]'
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
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      template: './admin/login.html',
      filename: 'admin/login.html',
      chunks: ['login']
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'assets/css', to: 'assets/css' },
        { from: 'assets/images', to: 'assets/images' },
        { from: 'assets/fonts', to: 'assets/fonts' },
        { from: 'assets/js', to: 'assets/js' },
        { from: 'admin/api', to: 'admin/api' },
        { from: '_headers', to: '_headers' },
        { from: 'admin/views', to: 'admin/views' },
        { from: 'node_modules/@fortawesome/fontawesome-free/css', to: 'assets/fontawesome/css' },
        { from: 'node_modules/@fortawesome/fontawesome-free/webfonts', to: 'assets/fontawesome/webfonts' }
      ]
    })
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 9000,
    hot: true,
    historyApiFallback: true
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