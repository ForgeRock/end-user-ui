const webpack = require('webpack');

function generateTheme () {
    let variableLoad = `
      @import "~bootstrap/scss/_functions.scss";
      @import "~bootstrap/scss/_mixins.scss";
      @import "@/scss/theme-variables.scss";
    `;

    if (process.env.npm_config_theme) {
        variableLoad += `@import "@/scss/${process.env.npm_config_theme}-theme.scss"; `;
    }

    variableLoad += '@import "~bootstrap/scss/_variables.scss";';

    return variableLoad;
};

function generateVariables (env) {
    process.env.VUE_APP_idmURL = env.npm_config_idmURL ? env.npm_config_idmURL : undefined;
    process.env.theme = env.npm_config_theme ? env.npm_config_theme : '"default"';
};

function getPlugins (env) {
    let plugins = [
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/
        }),
        new webpack.BannerPlugin('Copyright 2019-2020 ForgeRock AS. All Rights Reserved \n Use of this code requires a commercial software license with ForgeRock AS. or with one of its affiliates. All use shall be exclusively subject to such license between the licensee and ForgeRock AS.')
    ];

    // the process.env variables =>
    generateVariables(env);

    return plugins;
}

module.exports = {
    publicPath: './',
    runtimeCompiler: true,
    pages: {
        index: {
            // entry for the page
            entry: './src/main.js'
        }
    },
    devServer: {
        host: 'localhost',
        proxy: {
            '/openidm': {
                target: 'http://localhost:8080/openidm',
                pathRewrite: { '^/openidm': '' },
                changeOrigin: true
            }
        }
    },
    configureWebpack: {
        plugins: getPlugins(process.env)
    },
    css: {
        loaderOptions: {
            sass: {
                data: generateTheme()
            }
        }
    },
    pluginOptions: {
        i18n: {
            locale: 'en',
            fallbackLocale: 'en',
            localeDir: 'locales',
            enableInSFC: false
        }
    }
};
