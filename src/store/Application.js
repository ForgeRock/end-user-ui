import _ from 'lodash';

/**
 * State - Enduser data store information
 *      @param {boolean} workflow - Flag to allow the UI to know the workflow feature is available
 *      @param {boolean} passwordReset - Flag to allow the UI to know the password reset feature is available
 *      @param {boolean} usernameRecovery - Flag to allow the UI to know the username recovery feature is available
 *      @param {boolean} registration - Flag to allow the UI to know the registration feature is available
 *      @param {object} authHeaders - Request headers needed for authenticated requests in fullStack mode
 *      @param {object} authLogoutUrl - logoutUrl for user logged in via fullStack
 *      @param {object} amDataEndpoints - AM endpoints required for fullStack
 */
export default {
    state: {
        workflow: false,
        passwordReset: false,
        usernameRecovery: false,
        registration: false,
        authHeaders: null,
        authLogoutUrl: null,
        amDataEndpoints: null
    },

    setAmDataEndpointsAction (amDataEndpoints) {
        this.state.amDataEndpoints = amDataEndpoints;
    },

    clearAmDataEndpointsAction () {
        this.state.amDataEndpoints = null;
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

    setAuthHeadersAction (headers) {
        this.state.authHeaders = headers;
    },

    clearAuthHeadersAction () {
        this.state.authHeaders = null;
    },

    setAuthLogoutUrlAction (logoutUrl) {
        this.state.authLogoutUrl = logoutUrl;
    },

    clearAuthLogoutUrlAction () {
        this.state.authLogoutUrl = null;
    },

    clearEnduserSelfservice () {
        this.state.workflow = false;
        this.state.passwordReset = false;
        this.state.usernameRecovery = false;
        this.state.registration = false;
        this.state.authHeaders = null;
        this.state.authLogoutUrl = null;
        this.state.amDataEndpoints = null;
    }
};
