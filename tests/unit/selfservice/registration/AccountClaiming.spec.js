import AccountClaiming from '@/components/selfservice/registration/AccountClaiming';
import i18n from '@/i18n';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';

describe('SocialButtons.vue', () => {
    var sandbox = null;

    beforeEach(function () {
        sandbox = Sinon.createSandbox();
        sandbox.stub(AccountClaiming, 'mounted').callsFake(() => {});
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('Account Claiming loads', () => {
        const wrapper = shallowMount(AccountClaiming, {
            i18n
        });

        expect(wrapper.name()).to.equal('Account-Claiming');
    });
});
