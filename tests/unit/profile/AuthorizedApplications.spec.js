import i18n from '@/i18n';
import AuthorizedApplications from '@/components/profile/AuthorizedApplications';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';

describe('AuthorizedApplications.vue', () => {
    var sandbox = null;

    beforeEach(function () {
        sandbox = Sinon.createSandbox();
        sandbox.stub(AuthorizedApplications, 'mounted').callsFake(() => {});
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('Authorized Applications loads', () => {
        const wrapper = shallowMount(AuthorizedApplications, {
            i18n
        });

        expect(wrapper.name()).to.equal('Authorized-Applications');
    });

    it('showConfirmationModal sets correct application values and shows modal', () => {
        let spy = Sinon.spy();
        const wrapper = shallowMount(AuthorizedApplications, {
            i18n
        });
        wrapper.vm.$refs = { fsModal: { show: spy } };
        wrapper.vm.showConfirmationModal({ _id: '12345' });

        expect(wrapper.vm.confirmApplication.id).to.equal('12345');
        expect(spy.called).to.equal(true);
    });
});
