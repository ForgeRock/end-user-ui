const webpack = require('webpack'),
    GitRevisionPlugin = require('git-revision-webpack-plugin');

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
    return {
        NODE_ENV: '"production"',
        amURL: env.npm_config_amURL ? `"${env.npm_config_amURL}"` : undefined,
        idmURL: env.npm_config_idmURL ? `"${env.npm_config_idmURL}"` : undefined,
        loginURL: env.npm_config_loginURL ? `"${env.npm_config_loginURL}"` : undefined,
        platformMode: env.npm_config_platformMode ? `"${env.npm_config_platformMode}"` : false,
        theme: env.npm_config_theme ? `"${env.npm_config_theme}"` : '"default"',
        idmClientID: env.npm_config_idmClientID ? `"${env.npm_config_idmClientID}"` : undefined
    };
};

module.exports = {
    runtimeCompiler: true,
    pages: {
        index: {
            // entry for the page
            entry: process.env.npm_config_platformMode ? './src/platform-main.js' : './src/main.js'
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
        plugins: [
            new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/locale$/,
                contextRegExp: /moment$/
            }),
            new webpack.BannerPlugin('Copyright 2019 ForgeRock AS. All Rights Reserved \n Use of this code requires a commercial software license with ForgeRock AS. or with one of its affiliates. All use shall be exclusively subject to such license between the licensee and ForgeRock AS.'),
            new webpack.DefinePlugin({
                'process.env': generateVariables(process.env)
            }),
            new GitRevisionPlugin()
        ]
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
