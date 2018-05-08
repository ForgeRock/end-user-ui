import _ from 'lodash';

/**
 * State - Enduser data store information
 *      @param {string} userId - Unique system identifier for a user used to get their spefic profile information
 *      @param {string} managedResource - Managed object where profile information lives
 *      @param {array} roles - Available roles for a user
 *      @param {object} profile - JSON blob of the managed resource profile details
 *      @param {object} schema - JSON blob of the managed resource schema
 *      @param {string} firstName - Users first name pulled from profile details
 *      @param {string} sn - Users last name pulled from profile details
 *      @param {string} email - Users email pulled from profile details,
 *      @param {string} userName - Users username from profile details
 */
export default {
    state: {
        userId: null,
        managedResource: null,
        roles: null,
        profile: null,
        schema: null,
        givenName: '',
        sn: '',
        email: '',
        userName: ''
    },
    getUserState () {
        return _.clone(this.state);
    },

    setProfileAction (profile) {
        if (profile.givenName) {
            this.state.givenName = profile.givenName;
        } else {
            this.state.givenName = '';
        }

        if (profile.sn) {
            this.state.sn = profile.sn;
        } else {
            this.state.sn = '';
        }

        if (profile.email) {
            this.state.email = profile.email;
        } else {
            this.state.email = '';
        }

        if (profile.userName) {
            this.state.userName = profile.userName;
        } else {
            this.state.userName = '';
        }

        this.state.profile = profile;
    },

    clearProfileAction () {
        this.state.profile = null;
        this.state.givenName = '';
        this.state.sn = '';
        this.state.email = '';
        this.state.userName = '';
    },

    setSchemaAction (schema) {
        this.state.schema = schema;
    },

    clearSchemaAction () {
        this.state.schema = null;
    },

    setUserIdAction (newVal) {
        this.state.userId = _.clone(newVal);
    },

    clearUserIdAction () {
        this.state.userId = null;
    },

    setManagedResourceAction (newVal) {
        this.state.managedResource = _.clone(newVal);
    },

    clearManagedResourceAction () {
        this.state.managedResource = null;
    },

    setRolesAction (newVal) {
        this.state.roles = _.clone(newVal);
    },

    clearRolesAction () {
        this.state.roles = null;
    },

    clearStoreAction () {
        this.state.userId = null;
        this.state.managedResource = null;
        this.state.roles = null;
        this.state.profile = null;
        this.state.schema = null;
        this.state.givenName = '';
        this.state.sn = '';
        this.state.email = '';
        this.state.userName = '';
    }
};
