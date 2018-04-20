import UserStore from '@/store/User';

describe('User Store', () => {
    it('userId state management', () => {
        let userState = UserStore.getUserState();

        expect(userState.userId).to.equal(null);

        UserStore.setUserIdAction('test');
        userState = UserStore.getUserState();

        expect(userState.userId).to.equal('test');

        UserStore.clearUserIdAction();
        userState = UserStore.getUserState();

        expect(userState.userId).to.equal(null);
    });

    it('managedResource state management', () => {
        let userState = UserStore.getUserState();

        expect(userState.managedResource).to.equal(null);

        UserStore.setManagedResourceAction('test');
        userState = UserStore.getUserState();

        expect(userState.managedResource).to.equal('test');

        UserStore.clearManagedResourceAction();
        userState = UserStore.getUserState();

        expect(userState.managedResource).to.equal(null);
    });

    it('roles state management', () => {
        let userState = UserStore.getUserState();

        expect(userState.roles).to.equal(null);

        UserStore.setRolesAction('test');
        userState = UserStore.getUserState();

        expect(userState.roles).to.equal('test');

        UserStore.clearRolesAction();
        userState = UserStore.getUserState();

        expect(userState.roles).to.equal(null);
    });
});
