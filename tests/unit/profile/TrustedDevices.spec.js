import TrustedDevices from '@/components/profile/TrustedDevices';
import i18n from '@/i18n';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';

describe('TrustedDevices.vue', () => {
    var sandbox = null;

    beforeEach(function () {
        sandbox = Sinon.createSandbox();
        sandbox.stub(TrustedDevices, 'mounted').callsFake(() => {});
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('Trusted Devices loads', () => {
        const wrapper = shallowMount(TrustedDevices, {
            i18n
        });

        expect(wrapper.name()).to.equal('Trusted-Devices');
    });

    it('showConfirmationModal sets correct device values and shows modal', () => {
        let spy = Sinon.spy();
        const wrapper = shallowMount(TrustedDevices, {
            i18n
        });
        wrapper.vm.$refs = { fsModal: { show: spy } };
        wrapper.vm.showConfirmationModal({ uuid: '12345', name: 'test' });

        expect(wrapper.vm.confirmDevice.id).to.equal('12345');
        expect(wrapper.vm.confirmDevice.name).to.equal('test');
        expect(spy.called).to.equal(true);
    });
});
