import _ from 'lodash';

var state = {
    userId: null,
    managedResource: null,
    roles: null
};

export default {
    getUserState: function () {
        return state;
    },

    setUserIdAction: function (newVal) {
        state.userId = _.clone(newVal);
    },

    clearUserIdAction: function () {
        state.userId = null;
    },

    setManagedResourceAction: function (newVal) {
        state.managedResource = _.clone(newVal);
    },

    clearManagedResourceAction: function () {
        state.managedResource = null;
    },

    setRolesAction: function (newVal) {
        state.roles = _.clone(newVal);
    },

    clearRolesAction: function () {
        state.roles = null;
    },

    clearStore: function () {
        state.userId = null;
        state.managedResource = null;
        state.roles = null;
    }
};
