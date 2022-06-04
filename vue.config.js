const bootstrapSassAbstractsImports = require("vue-cli-plugin-bootstrap-vue/sassAbstractsImports.js");
// add logic for theming
bootstrapSassAbstractsImports.push(
  '@import "~@/assets/scss/theme-variables.scss"'
);

if(process.env.npm_config_theme) {
  bootstrapSassAbstractsImports.push('@import "~@/assets/scss/' +process.env.npm_config_theme+'-theme.scss"')
}
module.exports = {
  devServer: {
    proxy: 'http://localhost:8080'
  },
  // disable scss processing when testing
  chainWebpack: (config) => {
    if (process.env.NODE_ENV === 'test') {
      const scssRule = config.module.rule('scss');
      scssRule.uses.clear();
      scssRule
        .use('null-loader')
        .loader('null-loader');
    }
  },
  runtimeCompiler: true,
  assetsDir: 'static',
  css: {
    loaderOptions: {
      sass: {
        additionalData: bootstrapSassAbstractsImports.join("\n"),
      },
      scss: {
        additionalData: [...bootstrapSassAbstractsImports, ""].join(";\n"),
      },
    },
  },
};
