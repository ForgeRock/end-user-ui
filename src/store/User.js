import _ from 'lodash';

/**
 * State - Enduser data store information
 *      @param {string} userId - Unique system identifier for a user used to get their specific profile information
 *      @param {string} managedResource - Managed object where profile information lives
 *      @param {array} roles - Available roles for a user
 *      @param {object} profile - JSON blob of the managed resource profile details
 *      @param {object} schema - JSON blob of the managed resource schema
 *      @param {string} firstName - Users first name pulled from profile details
 *      @param {string} sn - Users last name pulled from profile details
 *      @param {string} email - Users email pulled from profile details,
 *      @param {string} userName - Users username from profile details
 *      @param {array} access - Available resources user has access to
 */
export default {
    state: {
        userId: null,
        managedResource: null,
        roles: null,
        internalUser: false,
        adminUser: false,
        profile: null,
        schema: null,
        access: [],
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

        if (profile.mail) {
            this.state.email = profile.mail;
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

    setUserIdAction (userId) {
        this.state.userId = _.clone(userId);
    },

    clearUserIdAction () {
        this.state.userId = null;
    },

    setManagedResourceAction (managedResource) {
        this.state.managedResource = _.clone(managedResource);

        if (managedResource === 'internal/user') {
            this.state.internalUser = true;
        }
    },

    clearManagedResourceAction () {
        this.state.managedResource = null;
    },

    setRolesAction (roles) {
        this.state.roles = _.clone(roles);

        if (_.includes(this.state.roles, 'internal/role/openidm-admin')) {
            this.state.adminUser = true;
        }
    },

    clearRolesAction () {
        this.state.roles = null;
    },

    setAccess (access) {
        this.state.access = _.clone(access);
    },

    clearAccess () {
        this.state.access = [];
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
        this.state.internalUser = false;
        this.state.adminUser = false;
        this.state.access = [];
    }
};
