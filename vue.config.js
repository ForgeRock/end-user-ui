/**
 * @license
 * Copyright (c) 2020-2024 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

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
    configureWebpack: function (config) {
        // Always use the runtime build of Vue.js
        config.resolve.alias = {
            'vue$': 'vue/dist/vue.runtime.esm.js',
            '@': require('path').resolve(__dirname, 'src') // Ensure the alias for @ is set to src
        };

        // Call getPlugins and add the plugins to the config
        config.plugins = (config.plugins || []).concat(getPlugins(process.env));
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
        plugins: getPlugins(process.env),
        module: {
            rules: [
                {
                    test: /\.m?js$/,
                    exclude: /node_modules\/(?!(sanitize-html|htmlparser2|domelementtype|domutils)\/).*/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                }
            ]
        }
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
