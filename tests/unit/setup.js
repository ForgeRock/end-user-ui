require('jsdom-global')(undefined, { url: 'https://localhost' });

global.localStorage = window.localStorage;