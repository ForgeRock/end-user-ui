import OAuthReturn from '@/components/OAuthReturn';
import i18n from '@/i18n';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';

describe('OAuthReturn.vue', () => {
    let sandbox = null;

    beforeEach(function () {
        sandbox = Sinon.createSandbox();
        sandbox.stub(OAuthReturn, 'created').callsFake(() => {});
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('OAuth Return loaded', () => {
        const wrapper = shallowMount(OAuthReturn, {
            i18n
        });

        expect(wrapper.name()).to.equal('OAuth-Return');
    });
});
