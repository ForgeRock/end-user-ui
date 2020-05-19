/* eslint-disable sort-keys */
import { clone, includes } from "lodash";

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
    clearProfileAction () {
        this.state.profile = null;
        this.state.givenName = "";
        this.state.sn = "";
        this.state.email = "";
        this.state.userName = "";
    },

    // eslint-disable-next-line max-statements
    clearStoreAction () {
        this.state.userId = null;
        this.state.managedResource = null;
        this.state.roles = null;
        this.state.profile = null;
        this.state.schema = null;
        this.state.givenName = "";
        this.state.sn = "";
        this.state.email = "";
        this.state.userName = "";
        this.state.internalUser = false;
        this.state.adminUser = false;
        this.state.access = [];
    },

    getUserState () {
        return clone(this.state);
    },

    // eslint-disable-next-line max-statements
    setProfileAction (profile) {
        if (profile.givenName) {
            this.state.givenName = profile.givenName;
        } else {
            this.state.givenName = "";
        }

        if (profile.sn) {
            this.state.sn = profile.sn;
        } else {
            this.state.sn = "";
        }

        if (profile.mail) {
            this.state.email = profile.mail;
        } else {
            this.state.email = "";
        }

        if (profile.userName) {
            this.state.userName = profile.userName;
        } else {
            this.state.userName = "";
        }

        this.state.profile = profile;
    },

    "state": {
        "access": [],
        "adminUser": false,
        "email": "",
        "givenName": "",
        "internalUser": false,
        "managedResource": null,
        "profile": null,
        "roles": null,
        "schema": null,
        "sn": "",
        "userId": null,
        "userName": ""
    },

    setSchemaAction (schema) {
        this.state.schema = schema;
    },

    clearSchemaAction () {
        this.state.schema = null;
    },

    setUserIdAction (userId) {
        this.state.userId = clone(userId);
    },

    clearUserIdAction () {
        this.state.userId = null;
    },

    setManagedResourceAction (managedResource) {
        this.state.managedResource = clone(managedResource);

        if (managedResource === "internal/user") {
            this.state.internalUser = true;
        }
    },

    clearManagedResourceAction () {
        this.state.managedResource = null;
    },

    setRolesAction (roles) {
        this.state.roles = clone(roles);

        if (includes(this.state.roles, "internal/role/openidm-admin")) {
            this.state.adminUser = true;
        }
    },

    clearRolesAction () {
        this.state.roles = null;
    },

    setAccess (access) {
        this.state.access = clone(access);
    },

    clearAccess () {
        this.state.access = [];
    }

};
