'use strict'
module.exports = {
  generateVariables: (env) => {
    return {
      NODE_ENV: '"production"',
      amURL: env.npm_config_amURL ? `"${env.npm_config_amURL}"` : undefined,
      idmURL: env.npm_config_idmURL ? `"${env.npm_config_idmURL}"` : undefined,
      loginURL : env.npm_config_loginURL ? `"${env.npm_config_loginURL}"` : undefined,
      platformMode: env.npm_config_platformMode ? `"${env.npm_config_platformMode}"` : false,
      theme: env.npm_config_theme ? `"${env.npm_config_theme}"` : '"default"',
      idmClientID: env.npm_config_idmClientID ? `"${env.npm_config_idmClientID}"` : undefined,
    }
  }
}
