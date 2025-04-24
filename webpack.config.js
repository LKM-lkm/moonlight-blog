const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    main: './src/index.js',
    admin: './admin/assets/js/admin.js',
    'admin/login': './assets/css/admin/login.css'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    clean: true,
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'index.html',
          to: 'index.html'
        },
        {
          from: 'admin/views/login.html',
          to: 'admin/login/index.html'
        },
        {
          from: 'admin/views',
          to: 'admin/views',
          globOptions: {
            ignore: ['**/login.html']
          }
        },
        {
          from: 'assets/css/admin',
          to: 'assets/css/admin'
        }
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist')
    },
    compress: true,
    port: 9000,
    hot: true,
    historyApiFallback: {
      rewrites: [
        { from: /^\/admin\/login/, to: '/admin/login/index.html' }
      ]
    }
  },
  resolve: {
    extensions: ['.js', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@admin': path.resolve(__dirname, 'admin')
    }
  }
}; 