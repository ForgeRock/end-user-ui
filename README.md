<p align="center">
  <b>Identity Management (End User) - UI</b>
  <p align="center">
    The End-User UI is no longer included in PingIDM 8.0 and later. Follow the documentation and guidance in this README.
    <br>

  <p align="center">
    Easy to integrate, standalone UI to demonstrate ForgeRock Identity Management.
    <br>
  <a href="https://docs.pingidentity.com/pingidm/7.5/release-notes/preface.html"><strong>Explore ForgeRock docs »</strong></a> 
  </p>
  <p align="center">
    The purpose of this readme is to help users set up a self-contained development environment for the End-User UI that can be customized and expanded.
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
- [Translations and Text](#translations-and-text)
- [Deployment](#deployment)
- [Theming](#theming)
- [Build command summary](#build-command-summary)
- [Build source code and Docker images using Maven](#build-using-maven)
- [Browser support](#browser-support)
- [Common questions](#common-questions)

<a name="quick-start"></a>
## Quick start

- [Download and install the latest node](https://nodejs.org/en/download/) or verify your node version `node -v`
- Check that you have the latest npm with `npm install npm@latest -g`
- Clone or download the repo: `https://stash.forgerock.org/projects/OPENIDM/repos/openidm-enduser` or `https://github.com/ForgeRock/end-user-ui`
- Navigate to your `openidm-enduser` directory and install dependencies with npm: `npm install`
- Update `proxyTable:target` in `vue.config.js` to point to your target IDM
- Start up target IDM (default startup is `http://localhost:8080`)
- Start development server with npm: `npm run dev`

### Optional Help

Vue provides a CLI to help with managing clients if you wish to make use of it you can do the following
- Run command `npm install -g @vue/cli` to install the Vue Client
- Then to open the management UI use `vue ui`

<a name="development-server"></a>
## Development server

`npm run dev` starts up a standalone node server primarily for ease of development. This development server also provides an easy way to test and understand various identity management features.

- Uses port `8080` by default, and auto-increments the port if `8080` is not available
- Assumes `openidm` is the context for the rest service (e.g. http://localhost:8080/openidm/info). If this is not the case, change idmContext `/src/main.js`, or context `/index.html`.
- Supports hot reloading and error display when code is changed
- Includes its own [testing](#testing)
- Built off [Vue CLI 3](https://cli.vuejs.org/config/)

<a name="development-server-tools"></a>
## Development server tools

- [Node](https://nodejs.org/en/download/) - Version 9.0.0 or newer (ForgeRock development verified 9.5.0)
- [NPM](https://www.npmjs.com/) - Version 5.0.0 or newer (ForgeRock development verified 6.4.1)

<a name="testing"></a>
## Testing

- Run tests with npm: `npm run test:unit`

<a name="testing-tools"></a>
## Testing tools

The following testing tools are installed when you install the project dependencies:

- [Vue testing utils](https://vue-test-utils.vuejs.org/) - Testing util library for Vue components
- [Sinon](https://sinonjs.org/) - Testing util library (stubs and spies)
- [Mocha-Webpack](http://zinserjan.github.io/mocha-webpack/) - Testing harness
- [Mocha](https://mochajs.org/) - Testing framework
- [Chai](http://chaijs.com/) - Assertion library
- [JSDom](https://github.com/jsdom/jsdom) - Browser simulation

<a name="application-structure"></a>
## Application structure

To help you with navigation, the application has the following basic layout:

```
tests/ - Folder containing the application tests
│
public/
├── static/ - Images and files that will not be processed by webpack
├── favicon.ico - Website fav icon
├── index.html - Application index.html
src/
├── components/ - General application components
│    ├── access/ - Delegated admin components
│    ├── dashboard/ - Dashboard widgets and workflow integration
│    ├── profile/ - Profile management components (KBA, password change, profile edit, social management, etc.)
│    ├── selfservice/ - Components for the various self-service flows (username recovery, password reset, registration, progressive profile, etc.)
│    ├── utils/ - Variety of support components that are used throughout the application
│    ├── Login.vue/ - Base login page for the application
│    ├── NotFound.vue/ - 404 page
│    └── OAuthReturn.vue/ - Handles OAuth returns for registration and login
├── assets - Images that will be processed by webpack
├── router - Application routes
├── i18n - Translation loader
├── scss/ - SCSS / CSS styling files
├── store/ - Shared data sources for components
├── locales/ - Translation files
├── App.vue - The base application Vue component
└── main.js - Initialization Javascript file
│
vue.config.js - Vue CLI configuration File
│
Package.json - Node package JSON for dependency management
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

There are several other libraries included with both node and the application, but these are the primary core libraries used throughout. For additional libraries, see package.json `/package.json`

<a name="translations-and-text"></a>
## Translations and Text

Application translation uses [Vue i18n](https://kazupon.github.io/vue-i18n/en/) and the `openidm/info/uiconfig` endpoint to get the current user's browser language.

The project only contains `en` based translations and falls back to `en` if an unsupported language is detected. To change the default language fallback adjust VueI18n `/src/main.js`.

Adding and changing an existing message for the `en` base language involves either adding a key or editing an existing key.
Keys follow JSON structure; for example, if you wanted to edit the navigation bar `Profile` to `User Profile` you would need to locate the appropriate key `en.pages.app.profile` and change the text.
Inside of your Vue application you would then make use of that key with the built in translation function `{{$t('pages.app.profile')}}` or `this.$t('pages.app.profile')`.

Adding a new translation language means creating a new translation file inside of locales folder with a key matching the translation language code.

For example:

```
en.json
fr.json
gr.json
```

Then creating a JSON key structure that should be mirrored across all of the language files.

For example:

``` JSON
    {
        dashboard: {
            welcomeMessage: 'Welcome!'
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

- Start the development server `npm run dev` and navigate to `src/router.js`.
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

# build with theme loaded
npm run build --theme=red

# run all tests
npm run test:unit
```

A `Dockerfile` is provided that bundles the contents of the `dist/` directory,
and a `nginx.conf` file to run the application using [NGINX](https://www.nginx.com/).

``` bash
# build docker image with custom name/tag
docker build -t custom/end-user-ui:custom-tag .
```

<a name="build-using-maven"></a>
## Build source code and Docker images using Maven

This project's source code can be built using [Apache Maven](https://maven.apache.org/)
and Docker images can be created using the [Fabric8 Docker Maven Plugin](https://dmp.fabric8.io/).

``` bash
# build all source code and output result to dist/ directory
mvn clean install

# build docker image using default settings
mvn docker:build

# build and push docker image with custom name/registry/tags
mvn docker:build docker:push \
  -Ddocker.name=custom/end-user-ui \
  -Ddocker.push.registry=custom.bintray.io \
  -Ddocker.tags.0=custom-tag \
  -Ddocker.tags.1=other-tag
```

<a name="browser-support"></a>
## Browser support

- Internet Explorer 11 or higher
- Latest Firefox
- Latest Safari
- Latest Chrome

<a name="common-questions"></a>
## Common Questions

- [Who This Project is For](#who-this-project-is-for)
- [How to Add a Self-Service Stage to the UI](#how-to-add-a-self-service-stage-to-the-ui)
- [How to Replace IDM End-User Files](#how-to-replace-idm-end-user-files)
- [How to Change End-User UI Path](#how-to-change-end-user-ui-path)
- [How to Provide Logout URL to External Applications](#how-to-provide-logout-url-to-external-applications)
- [How to Add Additional Registration Flows](#how-to-add-additional-registration-flows)
- [How to Configure Notification Polling](#how-to-configure-notification-polling)
- [How to Configure REST Call Timeouts](#how-to-configure-rest-call-timeouts)
- [What has Changed with Workflow](#what-has-changed-with-workflow)
- [Where to Find Privacy and Account Information in the End-User UI](#where-to-find-privacy-and-account-information-in-the-end-user-ui)
- [Where to Find Personal Information in the End-User UI](#where-to-find-personal-information-in-the-end-user-ui)
- [Where to Find Sign-In and Security](#where-to-find-sign-in-and-security)
- [Where to Find Account Preferences](#where-to-find-account-preferences)
- [How to Configure Trusted Devices](#how-to-configure-trusted-devices)
- [How to Control Personal Data Sharing](#how-to-control-personal-data-sharing)
- [Where to Manage Account Controls](#where-to-manage-account-controls)

<a name="who-this-project-is-for"></a>
### Who This Project is For

This project is meant to help developers and customers understand the features of ForgeRock Identity Management. A basic understanding of Javascript, HTML, CSS and Vue are required
to successfully navigate and understand the code.

<a name="how-to-add-a-self-service-stage-to-the-ui"></a>
### How to Add a Self-Service Stage to the UI

> **IMPORTANT**: This section applies only to PingIDM 7.5 and earlier.

This tutorial assumes you have created the backend portion of the stage and added that stage to the appropriate `selfservice-` file. If you need help with these steps please refer to the [ForgeRock Documentation](https://docs.pingidentity.com/pingidm/7.5/self-service-reference/preface.html).
These instructions apply to registration, password reset, and forgotten username.

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

<a name="how-to-replace-idm-end-user"></a>
### How to Replace IDM End-User Files

> **IMPORTANT**: This section applies only to PingIDM 7.5 and earlier.

1) Inside of the End User project Run `npm run build` to generate a distribution copy
2) Locate your current IDM project folder and navigate to `/path/to/your/openidm/ui/enduser`
3) Delete the contents from the unzipped openidm for `enduser` `/path/to/your/openidm/ui/enduser`
4) Copy files from the `dist` folder in End User over to IDM enduser `/path/to/your/openidm/ui/enduser`

**If you rebuild IDM you will need to perform these steps again as that process will replace the current zip contents.**

<a name="how-to-change-end-user-ui-path"></a>
### How to Change End-User UI Path

> **IMPORTANT**: This section applies only to PingIDM 7.5 and earlier.

By default, the End-User UI is registered at the root context and is accessible at the URL `localhost:8080`. To specify a different URL, edit the `project-dir/conf/ui.context-enduser.json` file, setting the `urlContextRoot` property to the new URL.

For example, to change the End-User UI URL to `localhost:8080/exampleui`, edit the file as follows:

``` json
"urlContextRoot" : "/exampleui",
```


<a name="how-to-provide-logout-url-to-external-applications"></a>
### How to Provide Logout URL to External Applications

> **IMPORTANT**: This section applies only to PingIDM 7.5 and earlier.

By default, an End-User UI session is invalidated when a user clicks on the Log out link. In certain situations, external applications might require a distinct logout URL to which users can be routed, to terminate their UI session.

The logout URL is `#logout`, appended to the UI URL. For example, `localhost:8080/#logout/`.

The logout URL effectively performs the same action as clicking on the **Log out** link of the UI.

<a name="how-to-add-additional-registration-flows"></a>
### How to Add Additional Registration Flows

> **IMPORTANT**: This section applies only to PingIDM 7.5 and earlier.

1. Add multiple `selfservice-registration.json` files, following [these docs](https://docs.pingidentity.com/pingidm/7.5/self-service-reference/uss-registration-config.html).
2. For each additional `selfservice-registration.json` file, clone `Registration.vue` and rename it to match the corresponding new registration file. For example, if you named the configuration file `selfservice-registrationsecondflow.json`, name the Vue file `RegistrationSecondFlow.vue`.
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
6. Make sure that your IDM `access.js` file is configured properly, based on [these docs](https://docs.pingidentity.com/pingidm/7.5/self-service-reference/uss-registration-config.html). You will see a forbidden access error if this file isn't configured correctly.
7. Assuming you are on the development sever and have used default settings, you should now be able to navigate through two separate registration flows : `localhost:8081/#/registration` and `localhost:8081/#/registrationsecondflow`.

<a name="how-to-configure-notification-polling"></a>
### How to Configure Notification Polling

> **IMPORTANT**: This section applies only to PingIDM 7.5 and earlier.

The End-User UI polls for new system notifications every `3000 milliseconds` by default.
To change the default polling time, follow these steps:

1) Navigate to `src/components/utils/ToolbarNotification.vue`.
2) Locate the function called `StartPolling`.
3) At the top of the function there is a variable `pollingDelay`.
4) Set the `pollingDelay` (in milliseconds) to adjust the notification polling interval.

To turn off polling, comment out or remove the `startPolling` method and remove any reference to that function.
This will result in the notifications loading only when the application is first loaded.

<a name="how-to-configure-rest-call-timeouts"></a>
### How to Configure REST Call Timeouts

REST calls in the End-User UI time out after `5000 milliseconds` by default. To change this timeout, follow these steps:

1) Navigate to `src/main.js`.
2) Locate the function called `getRequestService`.
3) At the top of the function there is a variable `timeout`.
4) Set the `timeout` (in milliseconds) to adjust the REST call timeout.

<a name="what-has-changed-with-workflow"></a>
### What has Changed with Workflow

With the new End-User UI, the default workflows in IDM have been updated to make use of `Vue JS` as a framework. Previously, these workflows used `JQuery` and `Handlebars`.
You will need to update any existing workflows to use `Vue JS` in order to use the new End-User UI. **Previously formatted workflows are not supported with the new End-User UI.**

<a name="where-to-find-privacy-and-account-information-in-the-end-user-ui"></a>
### Where to Find Privacy and Account Information in the End-User UI

> **IMPORTANT**: This section applies only to PingIDM 7.5 and earlier.

While end users can find their information in the End-User UI, you can use REST calls and audit logs to find the same information. Some of the information in this section, such as Trusted Devices and UMA-based sharing, may require integration with PingAM, as described in the [sample platform](https://backstage.forgerock.com/docs/platform/7.3/platform-setup-guide/preface.html) documentation.

What the end user sees upon log in to the End-User UI depends on which features are configured.

- When you log in to the End-User UI, you'll be taken to the PingIDM **Profile** page, with at least the following information under the **Settings** tab:

    - **Account Security**
    - **Preferences**
    - **Account Controls**

- At a minimum, the left panel displays the **Dashboard** and **Profile** buttons. If you've configured UMA, you'll also refer to a **Sharing** button. To view descriptions, click the **Menu** button.

- When you add features, additional options display on the profile page:

    - **Information in the End-User Profile Page**

      | Title | Description |
          |-------|-------------|
      | Account Security | Password and Security Questions, default |
      | Social Sign-in | Links to Social Identity Provider Accounts |
      | Authorized Applications | Applications that can access an account |
      | Trusted Devices | Based on system and browser |
      | Preferences | Default |
      | Personal Data Sharing | Provides control |
      | Account Controls | Includes collected account data (Default) |

<a name="where-to-find-personal-information-in-the-end-user-ui"></a>
### Where to Find Personal Information in the End-User UI

> **IMPORTANT**: This section applies only to PingIDM 7.5 and earlier.

To view account details in the End-User UI, go to **Profile > Edit Personal Info**. By default, user information includes at least a Username, First Name, Last Name, and Email Address.

Each user can modify this information as needed, as long as `"userEditable"` is set to `"true"` for the property in your project's `managed.json` file. Learn more in [Create and modify object types](https://docs.pingidentity.com/pingidm/7.5/objects-guide/creating-modifying-managed-objects.html).

<a name="where-to-find-sign-in-and-security"></a>
### Where to Find Sign-In and Security

> **IMPORTANT**: This section applies only to PingIDM 7.5 and earlier.

Under this tab, end users can change their passwords. They can also add, delete, or modify security questions, and link or unlink supported social identity accounts.

<a name="where-to-find-account-preferences"></a>
### Where to Find Account Preferences

> **IMPORTANT**: This section applies only to PingIDM 7.5 and earlier.

The preferences tab in the End-User UI allows end users to modify marketing preferences, as defined in the `managed.json` file, and in the **Managed Object User Property Preferences** tab.

End users can toggle marketing preferences. When PingIDM includes a mapping to a marketing database, these preferences are sent to that database. This can help administrators use PingIDM to target marketing campaigns and identify potential leads.

<a name="how-to-configure-trusted-devices"></a>
### How to Configure Trusted Devices

> **IMPORTANT**: This section applies only to PingIDM 7.5 and earlier.

A _trusted device_ uses PingAM's Device ID (Match) and Device ID (Save) authentication modules. When these modules are configured, end users can add these devices the first time they log in from a new location.

During the login process, when an end user selects **Log In**, that user is prompted for a **Trusted Device Name**. Users refer to their added devices under the **Trusted Devices** tab.

A trusted device entry is paired with a specific browser on a specific system. The next time the same end user logs in from the same browser and system, in the same location, that user should not be prompted to enter a trusted device again.

End users can remove their trusted devices from the tab.

<a name="how-to-control-personal-data-sharing"></a>
### How to Control Personal Data Sharing

> **IMPORTANT**: This section applies only to PingIDM 7.5 and earlier.

End users who go to the **Personal Data Sharing** section in the End-User UI have control over whether personal data is shared with an external database that might contain marketing leads.

The managed object record for end users who consent to sharing this data is shown in REST output and in the audit activity log as one `consentedMappings` object:

``` json
"consentedMappings" : [ {
   "mapping" : "managedUser_systemLdapAccounts",
   "consentDate" : "2017-08-25T18:13:08.358Z"
}
```

If enabled, end users manage this information in the **Personal Data Sharing** section in their profiles. If they select the **Allow** link, they can see the data properties that would be shared with the external database.

This option supports the right to restrict processing of user personal data.

<a name="where-to-manage-account-controls"></a>
### Where to Manage Account Controls

> **IMPORTANT**: This section applies only to PingIDM 7.5 and earlier.

The **Account Controls** section allows end users to download their account data (in JSON format) and to delete their accounts from PingIDM.

> **IMPORTANT**: When end users delete their accounts, the change is propagated to external systems by implicit sync. However, it is then up to the administrator of the external system to make sure that any additional user information is purged from that system.

To modify the message associated with the **Delete Your Account** option, refer to [Translations and text](#translations-and-text):

1) Find the `translation.json` file.
2) Search for the `deleteAccount` code block and edit the information.

The options shown in this section can help meet requirements related to data portability and the right to be forgotten.
