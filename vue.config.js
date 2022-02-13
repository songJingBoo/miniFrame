const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    devServer: {
      proxy: {
        // 代理/dev-api/user/login 到 target/user/login
        [process.env.VUE_APP_BASE_API]: {
          // target: 'https://mock.mengxuegu.com/mock/61700d0a4351af34a2ddf6ad/dev-api', // easy-mock自建项目地址
          // target: 'http://121.43.224.27:8083/', // chengshentao swagger地址
          target: 'http://127.0.0.1:7001/',
          changeOrigin: true,
          pathRewrite: {
            ['^' + process.env.VUE_APP_BASE_API]: ''
          }
        }
      }
    }
  },
  chainWebpack (config) {
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))

    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({ symbolId: 'icon-[name]' })
  }
}
