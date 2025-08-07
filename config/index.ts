import { defineConfig, type UserConfigExport } from '@tarojs/cli'
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin'
import devConfig from './dev'
import prodConfig from './prod'
// Import custom plugin to suppress SASS deprecation warnings
const SuppressSassWarningsPlugin = require('./plugins/SuppressSassWarningsPlugin')

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'webpack5'>(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport<'webpack5'> = {
    projectName: 'xunyan',
    date: '2025-3-7',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    defineConstants: {
    },
    copy: {
      patterns: [
      ],
      options: {
      }
    },
    framework: 'react',
    compiler: 'webpack5',
    // https://github.com/jd-opensource/taro-ui/issues/1834
    // https://github.com/jd-opensource/taro-ui/issues/1726
    // AtForm在小程序中渲染失败的bug
    // compiler: {
    //   type: 'webpack5',
    //   prebundle: {
    //     exclude: ['taro-ui']
    //   }
    // },
    cache: {
      enable: false // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
    },
    sass: {
      // Completely silence all SASS deprecation warnings
      data: `$sass-deprecate-warnings: false;`,
      resource: []
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {

          }
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        
        // Configure sass-loader to silence deprecation warnings from dependencies
        chain.module
          .rule('scss')
          .oneOf('normal')
          .use('sass-loader')
          .tap(options => ({
            ...options,
            sassOptions: {
              ...options?.sassOptions,
              quietDeps: true,
              silenceDeprecations: true
            }
          }))
        
        // Add custom plugin to suppress SASS deprecation warnings
        chain.plugin('suppress-sass-warnings').use(SuppressSassWarningsPlugin)
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: {
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[name].[chunkhash:8].js'
      },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {}
        },
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
          config: {
            namingPattern: 'module', // 转换模式，取值为 global/module
            generateScopedName: '[name]__[local]___[hash:base64:5]'
          }
        }
      },
      webpackChain(chain) {
        chain.resolve.plugin('tsconfig-paths').use(TsconfigPathsPlugin)
        
        // Configure sass-loader to silence deprecation warnings from dependencies
        chain.module
          .rule('scss')
          .oneOf('normal')
          .use('sass-loader')
          .tap(options => ({
            ...options,
            sassOptions: {
              ...options?.sassOptions,
              quietDeps: true,
              silenceDeprecations: true
            }
          }))
        
        // Add custom plugin to suppress SASS deprecation warnings
        chain.plugin('suppress-sass-warnings').use(SuppressSassWarningsPlugin)
      }
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        }
      }
    }
  }
  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig)
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig)
})
