module.exports = {
  env: {
    NODE_ENV: '"development"'
  },
  defineConstants: {
  },
  mini: {},
  h5: {
    devServer: {
      hot: true,
      historyApiFallback: true,
      host: '0.0.0.0',
      port: 10086,
      open: false
    }
  }
}
