# Mirai (Selfservice) - UI

> This project is a redesign and technical rebuild of the existing Enduser UI at Forgerock.

## Development goals
1. Parity with the existing "Enduser" UI
2. Improved design
3. Improved developer experience
4. Better testing

### Setup assumptions
Currently Mirai is built off of two starting assumptions:
1. Reliance of IDM endpoints for managing "Enduser" with the eventual integration of platform features
2. The development environment is configured to hit a rest service located at localhost:8080 (the development server proxy can be configured at config/index)

## Helpful links

### Base Tools
1. Node - Version 5.0.0 or newer
2. NPM - Version 8.0.0 or newer

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
6. Vee Validate (Validation) - https://github.com/baianat/vee-validate

### CSS Framework
1. SCSS (SASS) - https://sass-lang.com/
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
