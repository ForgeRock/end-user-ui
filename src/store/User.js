import _ from 'lodash';

var state = {
    userId: null,
    managedResource: null,
    roles: null
};

export default {
    getUserState () {
        return state;
    },

    setUserIdAction (newVal) {
        state.userId = _.clone(newVal);
    },

    clearUserIdAction () {
        state.userId = null;
    },

    setManagedResourceAction (newVal) {
        state.managedResource = _.clone(newVal);
    },

    clearManagedResourceAction () {
        state.managedResource = null;
    },

    setRolesAction (newVal) {
        state.roles = _.clone(newVal);
    },

    clearRolesAction () {
        state.roles = null;
    },

    clearStore () {
        state.userId = null;
        state.managedResource = null;
        state.roles = null;
    }
};
