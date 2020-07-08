import ApplicationStore from '@/store/Application';
import { expect } from 'chai';

describe('Application Store', () => {
    it('workflow state management', () => {
        expect(ApplicationStore.state.workflow).to.equal(false);

        ApplicationStore.setWorkflowAction(true);

        expect(ApplicationStore.state.workflow).to.equal(true);

        ApplicationStore.clearWorkflowAction();

        expect(ApplicationStore.state.workflow).to.equal(false);
    });

    it('passwordReset state management', () => {
        expect(ApplicationStore.state.passwordReset).to.equal(false);

        ApplicationStore.setPasswordResetAction(true);

        expect(ApplicationStore.state.passwordReset).to.equal(true);

        ApplicationStore.clearPasswordResetAction();

        expect(ApplicationStore.state.passwordReset).to.equal(false);
    });

    it('usernameRecovery state management', () => {
        expect(ApplicationStore.state.usernameRecovery).to.equal(false);

        ApplicationStore.setUsernameRecoveryAction(true);

        expect(ApplicationStore.state.usernameRecovery).to.equal(true);

        ApplicationStore.clearUsernameRecoveryAction();

        expect(ApplicationStore.state.usernameRecovery).to.equal(false);
    });

    it('registration state management', () => {
        expect(ApplicationStore.state.registration).to.equal(false);

        ApplicationStore.setRegistrationAction(true);

        expect(ApplicationStore.state.registration).to.equal(true);

        ApplicationStore.clearRegistrationAction();

        expect(ApplicationStore.state.registration).to.equal(false);
    });

    it('all selfservice state management', () => {
        let availability = [
            {
                name: 'retrieveUsername',
                enabled: true,
                endpoints: ['selfservice/username']
            },
            {
                name: 'registration',
                enabled: true,
                endpoints: ['selfservice/registration']
            }
        ];

        ApplicationStore.setEnduserSelfservice(availability);

        expect(ApplicationStore.state.usernameRecovery).to.equal(true);
        expect(ApplicationStore.state.registration).to.equal(true);

        ApplicationStore.clearEnduserSelfservice();

        expect(ApplicationStore.state.usernameRecovery).to.equal(false);
        expect(ApplicationStore.state.registration).to.equal(false);
    });
});
