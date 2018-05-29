import _ from 'lodash';

/**
 * State - Enduser data store information
 *      @param {boolean} workflow - Flag to allow the UI to know the workflow feature is available
 *      @param {boolean} passwordReset - Flag to allow the UI to know the password reset feature is available
 *      @param {boolean} usernameRecovery - Flag to allow the UI to know the username recovery feature is available
 *      @param {boolean} registration - Flag to allow the UI to know the registration feature is available
 */
export default {
    state: {
        workflow: false,
        passwordReset: false,
        usernameRecovery: false,
        registration: false
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

    clearEnduserSelfservice () {
        this.state.workflow = false;
        this.state.passwordReset = false;
        this.state.usernameRecovery = false;
        this.state.registration = false;
    }
};
