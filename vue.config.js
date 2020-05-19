/* eslint-disable camelcase */
/* eslint-disable func-style */
/* eslint-disable no-undefined */
/* eslint-disable no-process-env */
const CopyWebpackPlugin = require("copy-webpack-plugin"),
    webpack = require("webpack");


function generateTheme () {
    let variableLoad = `
      @import "~bootstrap/scss/_functions.scss";
      @import "~bootstrap/scss/_mixins.scss";
      @import "@/scss/theme-variables.scss";
    `;

    if (process.env.npm_config_theme) {
        variableLoad += `@import "@/scss/${process.env.npm_config_theme}-theme.scss"; `;
    }

    variableLoad += "@import \"~bootstrap/scss/_variables.scss\";";

    return variableLoad;
}

function generateVariables (env) {
    process.env.VUE_APP_amURL = env.npm_config_amURL ? env.npm_config_amURL : undefined;
    process.env.VUE_APP_idmURL = env.npm_config_idmURL ? env.npm_config_idmURL : undefined;
    process.env.VUE_APP_loginURL = env.npm_config_loginURL ? env.npm_config_loginURL : undefined;
    process.env.VUE_APP_platformMode = env.npm_config_platformMode ? env.npm_config_platformMode : false;
    process.env.theme = env.npm_config_theme ? env.npm_config_theme : "\"default\"";
    process.env.VUE_APP_idmClientID = env.npm_config_idmClientID ? env.npm_config_idmClientID : undefined;
}

function getPlugins (env) {
    const plugins = [
        new webpack.IgnorePlugin({
            "contextRegExp": /moment$/u,
            "resourceRegExp": /^\.\/locale$/u
        }),
        new webpack.BannerPlugin("Copyright 2019-2020 ForgeRock AS. All Rights Reserved \n Use of this code requires a commercial software license with ForgeRock AS. or with one of its affiliates. All use shall be exclusively subject to such license between the licensee and ForgeRock AS.")
    ];

    // The process.env variables =>
    generateVariables(env);

    if (env.npm_config_platformMode) {
        // eslint-disable-next-line no-console
        console.log("platform detected...");
        plugins.push(new CopyWebpackPlugin([
            {
                "from": "node_modules/appauthhelper/appAuthHelperRedirect.html",
                "to": "appAuthHelperRedirect.html",
                "toType": "file"
            },
            {
                "from": "node_modules/appauthhelper/appAuthHelperFetchTokensBundle.js",
                "to": "node_modules/appauthhelper/appAuthHelperFetchTokensBundle.js",
                "toType": "file"
            },
            {
                "from": "node_modules/oidcsessioncheck/sessionCheck.html",
                "to": "sessionCheck.html",
                "toType": "file"
            },
            {
                "from": "node_modules/oidcsessioncheck/sessionCheckFrame.js",
                "to": "sessionCheckFrame.js",
                "toType": "file"
            }
        ]));
    }

    return plugins;
}

module.exports = {
    "configureWebpack": {
        "plugins": getPlugins(process.env)
    },
    "css": {
        "loaderOptions": {
            "sass": {
                "prependData": generateTheme()
            }
        }
    },
    "devServer": {
        "host": "localhost",
        "proxy": {
            "/openidm": {
                "changeOrigin": true,
                "pathRewrite": { "^/openidm": "" },
                "target": "http://localhost:8080/openidm"
            }
        }
    },
    "pages": {
        "index": {
            // Entry for the page
            "entry": process.env.npm_config_platformMode ? "./src/platform-main.js" : "./src/main.js"
        }
    },
    "pluginOptions": {
        "i18n": {
            "enableInSFC": false,
            "fallbackLocale": "en",
            "locale": "en",
            "localeDir": "locales"
        }
    },
    "publicPath": "./",
    "runtimeCompiler": true
};
