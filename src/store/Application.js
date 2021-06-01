/**
 * @license
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import _ from 'lodash';

/**
 * State - Enduser data store information
 *      @param {boolean} workflow - Flag to allow the UI to know the workflow feature is available
 *      @param {boolean} passwordReset - Flag to allow the UI to know the password reset feature is available
 *      @param {boolean} usernameRecovery - Flag to allow the UI to know the username recovery feature is available
 *      @param {boolean} registration - Flag to allow the UI to know the registration feature is available
 *      @param {string} idmBaseURL - Location of IDM
 *      @param {string} theme - Current theme set for the application
 *      @param {object} managedObjectSettings - Settings for displaying grids and search results and for building query requests with large data sets
 */
export default {
    state: {
        workflow: false,
        passwordReset: false,
        usernameRecovery: false,
        registration: false,
        idmBaseURL: '/openidm',
        theme: 'default',
        managedObjectSettings: null
    },

    setEnvironment (env) {
        if (env.VUE_APP_idmURL) {
            this.state.idmBaseURL = env.VUE_APP_idmURL;
        }

        if (env.VUE_APP_theme) {
            this.state.theme = env.VUE_APP_theme;
        }
    },

    setWorkflowAction (available) {
        this.state.workflow = available;
    },

    clearWorkflowAction () {
        this.state.workflow = false;
    },

    setPasswordResetAction (available) {
        this.state.passwordReset = available;
    },

    clearPasswordResetAction () {
        this.state.passwordReset = false;
    },

    setUsernameRecoveryAction (available) {
        this.state.usernameRecovery = available;
    },

    clearUsernameRecoveryAction () {
        this.state.usernameRecovery = false;
    },

    setRegistrationAction (available) {
        this.state.registration = available;
    },

    clearRegistrationAction () {
        this.state.registration = false;
    },

    setEnduserSelfservice (availability) {
        _.each(availability, (feature) => {
            if (feature.name === 'retrieveUsername' && _.find(feature.endpoints, (el) => { return el === 'selfservice/username'; })) {
                this.setUsernameRecoveryAction(feature.enabled);
            } else if (feature.name === 'passwordReset' && _.find(feature.endpoints, (el) => { return el === 'selfservice/reset'; })) {
                this.setPasswordResetAction(feature.enabled);
            } else if (feature.name === 'registration' && _.find(feature.endpoints, (el) => { return el === 'selfservice/registration'; })) {
                this.setRegistrationAction(feature.enabled);
            } else if (feature.name === 'workflow') {
                this.setWorkflowAction(feature.enabled);
            }
        });
    },

    setManagedObjectSettings (managedObjectSettings) {
        this.state.managedObjectSettings = managedObjectSettings;
    },

    clearEnduserSelfservice () {
        this.state.workflow = false;
        this.state.passwordReset = false;
        this.state.usernameRecovery = false;
        this.state.registration = false;
    }
};
