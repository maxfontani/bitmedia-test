module.exports = function (api) {
    api.cache(true)
  
    return {
      presets: [
        ['@babel/preset-env', {
          useBuiltIns: 'entry',
          loose: true
        }],
        '@babel/preset-react'
      ],
      plugins: [
        '@babel/plugin-proposal-export-default-from',
        '@babel/plugin-proposal-export-namespace-from',
      ]
    }
  }