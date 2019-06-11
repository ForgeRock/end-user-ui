const webpack = require('webpack')
    CopyWebpackPlugin = require('copy-webpack-plugin'),
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
    process.env.VUE_APP_amURL = env.npm_config_amURL ? env.npm_config_amURL : undefined;
    process.env.VUE_APP_idmURL = env.npm_config_idmURL ? env.npm_config_idmURL : undefined;
    process.env.VUE_APP_loginURL = env.npm_config_loginURL ? env.npm_config_loginURL : undefined;
    process.env.VUE_APP_platformMode = env.npm_config_platformMode ? env.npm_config_platformMode : false;
    process.env.theme = env.npm_config_theme ? env.npm_config_theme : '"default"';
    process.env.VUE_APP_idmClientID = env.npm_config_idmClientID ? env.npm_config_idmClientID : undefined;
};

function getPlugins (env) {
    let plugins = [
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/
        }),
        new webpack.BannerPlugin('Copyright 2019 ForgeRock AS. All Rights Reserved \n Use of this code requires a commercial software license with ForgeRock AS. or with one of its affiliates. All use shall be exclusively subject to such license between the licensee and ForgeRock AS.'),
        new GitRevisionPlugin()
    ];

    // the process.env variables =>
    generateVariables(env);

    if (env.npm_config_platformMode) {
        console.log('platform detected...');
        plugins.push(new CopyWebpackPlugin([
            {
                from: 'node_modules/appauthhelper/appAuthHelperRedirect.html',
                to: 'appAuthHelperRedirect.html',
                toType: 'file'
            },
            {
                from: 'node_modules/appauthhelper/appAuthHelperFetchTokensBundle.js',
                to: 'node_modules/appauthhelper/appAuthHelperFetchTokensBundle.js',
                toType: 'file'
            },
            {
                from: 'node_modules/oidcsessioncheck/sessionCheck.html',
                to: 'sessionCheck.html',
                toType: 'file'
            },
            {
                from: 'node_modules/oidcsessioncheck/sessionCheckFrame.js',
                to: 'sessionCheckFrame.js',
                toType: 'file'
            }
        ]));
    }

    return plugins;
}

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
