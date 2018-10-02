<p align="center">
  <b>Identity Management (End User) - UI</b>

  <p align="center">
    Easy to integrate, standalone UI to demonstrate ForgeRock Identity Management.
    <br>
    <a href="https://backstage.forgerock.com/docs/"><strong>Explore ForgeRock docs »</strong></a>
  </p>
  <p align="center">
    The purpose of this readme is to help users setup a self contained development environment for the End User UI that can be customized and expanded.
  </p>
</p>

## Table of contents

- [Quick start](#quick-start)
- [Development server](#development-server)
- [Development server tools](#development-server-tools)
- [Testing](#testing)
- [Testing tools](#testing-tools)
- [Application structure](#application-structure)
- [Application tools](#application-tools)
- [Translations](#translations)
- [Deployment](#deployment)
- [Theming](#theming)
- [Build command summary](#build-command-summary)
- [Browser support](#browser-support)
- [Common questions](#common-questions)

<a name="quick-start"></a>
## Quick start

- [Download and install the latest node](https://nodejs.org/en/download/) or verify your node version `node -v`
- Check that you have the latest npm with `npm install npm@latest -g`
- Clone or download the repo: `https://stash.forgerock.org/projects/OPENIDM/repos/openidm-enduser`
- Navigate to your `openidm-enduser` directory and install dependencies with npm: `npm install`
- Update `proxyTable:target` in [config/index.js](https://stash.forgerock.org/users/jason.browne/repos/openidm-enduser/browse/config/index.js) to point to your target IDM
- Start up target IDM (default startup is `http://localhost:8080`)
- Start development server with npm: `npm run dev`

<a name="development-server"></a>
## Development server

`npm run dev` starts up a standalone node server primarily for ease of development. This development server also provides an easy way to test and understand various identity management features.

- Uses port `8080` by default, and auto-increments the port if `8080` is not available
- Assumes `openidm` is the context for the rest service (e.g. http://localhost:8080/openidm/info). If this is not the case, change [idmContext](https://stash.forgerock.org/projects/OPENIDM/repos/openidm-enduser/browse/src/main.js), or [context](https://stash.forgerock.org/projects/OPENIDM/repos/openidm-enduser/browse/index.html).
- Supports hot reloading and error display when code is changed
- Includes its own [testing](#testing)
- Built off [Vue Webpack Template](http://vuejs-templates.github.io/webpack/)

<a name="development-server-tools"></a>
## Development server tools

- [Node](https://nodejs.org/en/download/) - Version 5.0.0 or newer (ForgeRock development verified 6.4.1)
- [NPM](https://www.npmjs.com/) - Version 8.0.0 or newer (ForgeRock development verified 9.5.0)

<a name="testing"></a>
## Testing

- Run tests with npm: `npm test`

Running tests provides a console display with test results and generates a viewable testing result report for browser display `test/unit/coverage/lcov-report`.

- Run tests for browser debugging: `npm run unit:watch`

This command runs two copies of the tests - one in the phantom JS headless browser and another at `localhost:9876` that can be used to watch or debug on your local browser.

<a name="testing-tools"></a>
## Testing tools

The following testing tools are installed when you install the project dependencies:

- [Vue testing utils](https://vue-test-utils.vuejs.org/) - Testing util library for Vue components
- [Sinon](https://sinonjs.org/) - Testing util library (stubs and spies)
- [Karma](https://karma-runner.github.io/2.0/index.html) - Testing harness
- [Mocha](https://mochajs.org/) - Testing framework
- [Chai](http://chaijs.com/) - Assertion library
- [PhantomJS](https://github.com/ariya/phantomjs) - Headless browser

<a name="application-structure"></a>
## Application structure

To help you with navigation, the application has the following basic layout:

```
src/
├── components/ - General application components
│    ├── access/ - Delegated admin components
│    ├── mains/ - Main entry point for router and primary components
│    ├── profile/ - Profile management components (KBA, password change, profile edit, social management, etc.)
│    ├── selfservice/ - Components for the various self-service flows (username recovery, password reset, registration, progressive profile, etc.)
│    ├── uma/ - User Managed Access integration
│    ├── utils/ - Variety of support components that are used throughout the application
│    └── widgets/ - Dashboard widgets and workflow integration
├── router - Application routes
├── scss - SCSS / CSS styling files
├── store - Shared data sources for components
├── translations - Translation files
├── App.vue - The base application Vue component
└── main.js - Initialization Javascript file

```

<a name="application-tools"></a>
## Application tools

The following application tools are installed when you install the project dependencies:

- [Vue](https://vuejs.org/v2/api/) - Primary Javascript framework for the project
- [Vue Router](https://router.vuejs.org/en/) - Application routing Vue library
- [Vue Bootstrap](https://bootstrap-vue.js.org/) - Bootstrap 4 Vue components
- [Axios](https://github.com/axios/axios) - Javascript Promise Library
- [Vue i18n](https://kazupon.github.io/vue-i18n/en/) - Translation library for Vue
- [Vee Validate](https://github.com/baianat/vee-validate) - Form validation for Vue
- [lodash](https://lodash.com/) - Util library for preforming various efficient calculations

There are several other libraries included with both node and the application, but these are the primary core libraries used throughout. For additional libraries, see [package.json](https://stash.forgerock.org/users/jason.browne/repos/openidm-enduser/browse/package.json)

<a name="translations"></a>
## Translations

Application translation uses [Vue i18n](https://kazupon.github.io/vue-i18n/en/) and the `openidm/info/uiconfig` endpoint to get the current user's browser language.

The project only contains `en` based translations and falls back to `en` if an unsupported language is detected. To change the default language fallback adjust [VueI18n](https://stash.forgerock.org/projects/OPENIDM/repos/openidm-enduser/browse/src/main.js).

Adding a new translation means expanding the current JSON contained in `src/translations/index.js` with the corresponding language code and appropriate mirrored structure.


For example:

``` json

{
    en: {
        welcome: 'Welcome'
    },

    fr: {
        welcome: 'Bienvenue'
    }
}

```

<a name="deployment"></a>
## Deployment

- To deploy the application, run: `npm run build`

Running `npm run build` creates a distribution file in the `dist` folder and two detail files for support or QA purposes: `COMMITHASH` and `VERSION`. Each deployment use case is different.

<a name="theming"></a>
## Theming

The following theming tools are installed when you install the project dependencies:

- [SCSS](https://sass-lang.com/) - CSS enhancmenet library
- [Bootstrap 4.0](https://getbootstrap.com) - CSS Styling framework

Theming makes use of two concepts:

- Theming follows the basic [Bootstrap theming guidelines](https://getbootstrap.com/docs/4.0/getting-started/theming/) and relies on SCSS variable overrides.
- The theme file is loaded with an optional flag when running the dev server or distribution build. For example, `npm run dev --theme=red` or `npm run build --theme=red`.

When you include the theme flag, the `node` build scripts attempt to locate a corresponding file in `src/scss`. The file must also contain a `-theme.scss` moniker, for example, `red-theme.scss`.

The default project includes three themes:
- ForgeRock default theme
- ForgeRock dark theme `npm run --theme=dark`
- ForgeRock rock theme `npm run --theme=rock`. This theme demonstrates how to use a full background image, with fallback to the default theme.

The project also includes a style guide, available when running the development server. To access the style guide:

- Start the development server `npm run dev` and navigate to `src/router/index.js`.
- Uncomment `import Styleguide from '../../styleguide/Styleguide'`; and the corresponding commented out style guide route.
- Navigate to `http://localhost:8081/#/styleguide`.

The style guide gives an indication of how new themes and styles will impact base application components.

<a name="build-command-summary"></a>
## Build command summary

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080 (increments by 1 automatically if port is in use).
npm run dev

# server with theme loaded
npm run dev --theme=red

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# build with theme loaded
npm run build --theme=red

# run all tests
npm test
```

<a name="browser-support"></a>
## Browser support

- Internet Explorer 11 or higher
- Latest Firefox
- Latest Safari
- Latest Chrome

<a name="common-questions"></a>
## Common Questions

- [Who this project is for](#who-this-project-is-for)
- [How to Add a Self-Service Stage to the UI](#how-to-add-a-self-service-stage-to-the-ui)
- [How to Replace IDM End User files](#how-to-replace-a-idm-enduser)
- [How to Add Additional Registration Flows](#how-to-add-additional-registration-flows)
- [How to Configure Notification Polling](#how-to-configure-notification-polling)
- [How to Configure REST Call Timeouts](#how-to-configure-rest-call-timeouts)
- [What has Changed with Workflow](#what-has-changed-with-workflow)

<a name="who-this-project-is-for"></a>
### Who this project is for

This project is meant to help developers and customers understand the features of ForgeRock Identity Management. A basic understanding of Javascript, HTML, CSS and Vue are required
to successfully navigate and understand the code.

<a name="how-to-add-a-self-service-stage-to-the-ui"></a>
### How to Add a Self-Service Stage to the UI

This tutorial assumes you have created the backend portion of the stage and added that stage to the appropriate `selfservice-` file. If you need help with these steps please refer to the [ForgeRock Documentation](https://backstage.forgerock.com/docs/idm/6.5/self-service-reference/#chap-custom-stages). (Links will be available after IDM 6.5 is released.)

1. Create a `.vue` file. Depending on the self-service flow you'll want to add the file to the appropriate location in the file structure. For example, a registration stage would go under `src/selfservice/registration`.
2. After the file is created, we follow a combination of Vue component structure and a self-service stage pattern that ForgeRock has established:

``` javascript

<template>
    <div>
        <!-- Component HTML Here -->
        <h1>Hello I am loaded</h1>
    </div>
</template>

<script>
    // Import statements can be used to make use of other components
    // these can be both local files or npm imported files
    import _ from 'lodash'; // npm file
    import LoadingButton from '@/components/utils/LoadingButton'; // Locally created file


    export default {
        name: 'NewStage',
        // selfServiceDetails are passed in from the self-service controlling component
        // this is available for every component and should be required
        props: {
            selfServiceDetails: { required: true }
        },
        methods: {
            // This function isn't required, but it is a standard we use to format and get the data
            getData () {
                return {
                    consentGiven: 'true'
                };
            },

            save () {
                // The parent self-service controller (e.g. registration, username and passwordreset) all listen for this save event
                // The save event should include a return of the data that the selvservice stage expects
                this.$emit('advanceStage', this.getData());
            },

            // Every component should include a isValid function
            // This function is used by the parent component to ensure that the child component is in an okay state to save
            // If your component is simple and doesn't need validation, simply return Promise.resolve(true)
            isValid () {
                return Promise.resolve(true);
            }
        }
    };
</script>

// Here we place component level styles
// You can also make use of SCSS variables
<style scoped></style>

```

3. After the component is created, import it into the self-service controlling component so that it can be used. This example uses registration `src/mains/Registration.vue`.

``` javascript

    //On the import line add the new Vue component
    // @ can be used as short hand for the src directory
    import TermsAndConditions from '@/components/selfservice/registration/TermsAndConditions';
    // Relative path also works
    import GenericSelfService from '../selfservice/common/GenericSelfService';
    import NewStage from '@/components/selfservice/registration/NewStage'
```

4. When the component is imported, add it into the self-service controlling component. **Note that the name of your component must match the return name from the backend. This is how the UI dynamically loads the components and steps through the self-service process.**

``` javascript
    components: {
        TermsAndConditions,
        GenericSelfService,
        NewStage
    },
```

*If you name the file something other than the backend name, you can align the name either in the import statement or in the components declaration.*

5. When these steps are complete, all that remains is to step through the self-service process with the new stage added and validate that everything is hooked up.

<a name="how-to-replace-a-idm-enduser"></a>
### How to Replace IDM End User

1) Inside of the End User project Run `npm run build` to generate a distribution copy
2) Locate your current IDM project folder and navigate to `/path/to/your/openidm/ui/enduser`
3) Delete the contents from the unzipped openidm for `enduser` `/path/to/your/openidm/ui/enduser`
4) Copy files from the `dist` folder in End User over to IDM enduser `/path/to/your/openidm/ui/enduser`

**If you rebuild IDM you will need to perform these steps again as that process will replace the current zip contents.**

<a name="how-to-add-additional-registration-flows"></a>
### How to Add Additional Registration Flows

1. Add multiple `selfservice-registration.json` files, following [these docs](https://backstage.forgerock.com/docs/idm/6.5/integrators-guide/#uss-registration). (Links will be available after IDM 6.5 is released.)
2. For each additional `selfservice-registration.json` file, clone `Registration.vue` and rename it to match the corresponding new registration file. For example, if you named the configuration file `selfservice-registrationsecondflow.json`, name the vue file `RegistrationSecondFlow.vue`.
3. In the new Vue file, change the variable `apiType: 'registration'`, to match your `selfservice-` file. For example, if your configuration file is named `selfservice-registrationsecondflow` change the variable to `apiType: 'registrationsecondflow'`.
4. Locate the router file `router/index.js` and add a route for the new file:

``` json
    {
        path: '/registrationsecondflow',
        name: 'RegistrationSecondFlow',
        component: RegistrationSecondFlow,
        meta: { hideToolbar: true, bodyClass: 'fr-body-image' },
        props: true
    },
```

5. At the top of the `router/index.js` file, import the new Vue file and ensure that it matches the component that you specified in the route: `import RegistrationSecondFlow from '@/components/mains/RegistrationSecondFlow';`
6. Make sure that your IDM access.js file is configured properly, based on [these docs](https://backstage.forgerock.com/docs/idm/6.5/integrators-guide/#uss-registration). (Links will be available after IDM 6.5 is released.) You will see a forbidden access error if this file isn't configured correctly.
7. Assuming you are on the development sever and have used default settings, you should now be able to navigate through two separate registration flows : `localhost:8081/#/registration` and `localhost:8081/#/registrationsecondflow`.

<a name="how-to-configure-notification-polling"></a>
### How to Configure Notification Polling

The End User UI polls for new system notifications every `3000 milliseconds` by default.
To change the default polling time, follow these steps:

1) Navigate to `src/components/utils/ToolbarNotification.vue`
2) Locate the function called `StartPolling`
3) At the top of the function there is a variable `pollingDelay`
4) Set the `pollingDelay` (in milliseconds) to adjust the notification polling interval.

<a name="how-to-configure-rest-call-timeouts"></a>
### How to Configure REST Call Timeouts

REST calls in the End User UI time out after `5000 milliseconds` by default. To change this timeout, follow these steps:

1) Navigate to `src/main.js`
2) Locate the function called `getRequestService`
3) At the top of the function there is a variable `timeout`
4) Set the `timeout` (in milliseconds) to adjust the REST call timeout.

<a name="what-has-changed-with-workflow"></a>
### What has Changed with Workflow

With the new End User UI the default workflows in IDM have been updated to make use of `Vue JS` as a framework. Previously, these workflows used `JQuery` and `Handlebars`.
You will need to update any existing workflows to use `Vue JS` in order to use the new End User UI. **Previously formatted workflows are not supported with the new End User UI.**