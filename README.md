# Enduser - UI

> This project is a redesign and technical rebuild of the existing IDM "enduser" UI.

## Development goals
1. Feature parity with the existing "enduser" UI
2. Improved design
3. Better testing

### Setup assumptions
1. IDM is started and available on 8080 (for development, for deployment it assums IDM exists in the same domain)
  * Start IDM first -> Simple IDM second

## Helpful links

### Testing
1. Vue testing utils - https://vue-test-utils.vuejs.org/en/guides/common-tips.html
2. Sinon - http://legacy.sinonjs.org/docs/
3. Mocha - https://mochajs.org/#getting-started
4. Chai - http://chaijs.com/

### Javascript Framework
1. Vue js - https://vuejs.org/v2/api/
2. Vue route - https://router.vuejs.org/en/
3. Vue bootstrap - https://bootstrap-vue.js.org/
4. Axios (AJAX handling) - https://github.com/axios/axios
5. Vue i18n (Translations) - https://kazupon.github.io/vue-i18n/en/

### CSS Framework
1. Less - http://lesscss.org/
2. Bootstrap 4.0 - https://getbootstrap.com/

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080 (increments by 1 automatically if port is in use).
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```
