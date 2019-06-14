import _ from 'lodash';

/**
 * State - Enduser data store information
 *      @param {boolean} workflow - Flag to allow the UI to know the workflow feature is available
 *      @param {boolean} passwordReset - Flag to allow the UI to know the password reset feature is available
 *      @param {boolean} usernameRecovery - Flag to allow the UI to know the username recovery feature is available
 *      @param {boolean} registration - Flag to allow the UI to know the registration feature is available
 *      @param {object} authHeaders - Request headers needed for authenticated requests in fullStack mode
 *      @param {object} amDataEndpoints - AM endpoints required for fullStack
 *      @param {string} idmBaseURL - Location of IDM
 *      @param {string} loginURL - If platformMode is true then an external login/selfservice URL needs to be provided if there is no token
 *      @param {boolean} platformMode - Tells enduser whether it should expect both IDM and AM or just an IDM only environment
 *      @param {string} theme - Current theme set for the application
 *      @param {string} idmClientID - IDM client ID used for platform calls in conjunction with AM
 */
export default {
    state: {
        workflow: false,
        passwordReset: false,
        usernameRecovery: false,
        registration: false,
        authHeaders: null,
        amDataEndpoints: null,
        loginRedirect: null,
        amBaseURL: null,
        idmBaseURL: '/openidm',
        loginURL: null,
        platformMode: false,
        theme: 'default',
        idmClientID: null
    },

    setEnvironment (env) {
        if (env.VUE_APP_amURL) {
            this.state.amBaseURL = env.VUE_APP_amURL;
        }

        if (env.VUE_APP_idmURL) {
            this.state.idmBaseURL = env.VUE_APP_idmURL;
        }

        if (env.VUE_APP_platformMode === 'true') {
            this.state.platformMode = true;
        }

        if (env.VUE_APP_loginURL) {
            this.state.loginURL = env.VUE_APP_loginURL;
        }

        if (env.VUE_APP_theme) {
            this.state.theme = env.VUE_APP_theme;
        }

        if (env.VUE_APP_idmClientID) {
            this.state.idmClientID = env.VUE_APP_idmClientID;
        }
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

    setLoginRedirect (redirect) {
        this.state.loginRedirect = redirect;
    },

    clearLoginRedirect () {
        this.state.loginRedirect = null;
    },

    clearEnduserSelfservice () {
        this.state.workflow = false;
        this.state.passwordReset = false;
        this.state.usernameRecovery = false;
        this.state.registration = false;
        this.state.authHeaders = null;
        this.state.amDataEndpoints = null;
        this.state.loginRedirect = null;
    }
};
