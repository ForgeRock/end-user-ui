import i18n from '@/i18n';
import SocialIdentities from '@/components/profile/SocialIdentities';
import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import Sinon from 'sinon';

describe('SocialIdentities.vue', () => {
    var sandbox = null;

    beforeEach(function () {
        sandbox = Sinon.createSandbox();
        sandbox.stub(SocialIdentities, 'mounted').callsFake(() => {});
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('Social Identities loaded', () => {
        const wrapper = mount(SocialIdentities, {
            i18n
        });

        expect(wrapper.name()).to.equal('Social-Identities');
    });

    it('Social Identities shows and hides the disconnect modal', () => {
        const wrapper = mount(SocialIdentities, {
            i18n
        });

        wrapper.setData({
            toDisconnect: {},
            providers: [{ 'provider': 'test', 'uiConfig': { 'buttonImage': 'test' } }, { 'provider': 'test2', 'uiConfig': { 'buttonImage': 'test2' } }]
        });

        wrapper.vm.showModal('test');
        expect(wrapper.vm.toDisconnect.provider).to.equal('test');
        wrapper.vm.hideModal();
        expect(wrapper.vm.toDisconnect.provider).to.equal(undefined);
    });

    it('Social Identities merges provider objects', () => {
        const wrapper = mount(SocialIdentities, {
            i18n
        });

        wrapper.setData({
            allAvailableProviders: [
                { 'provider': 'facebook', 'uiConfig': { 'buttonImage': 'test' } },
                { 'provider': 'wordpress', 'uiConfig': { 'buttonImage': 'test2' } },
                { 'provider': 'google', 'uiConfig': { 'buttonImage': 'test3' } },
                { 'provider': 'linkedin', 'uiConfig': { 'buttonImage': 'test4' } }
            ],
            connectedProviders: [
                { 'provider': 'google', '_refResourceCollection': 'managed/google', 'uiConfig': { 'buttonImage': 'test2' } },
                { 'provider': 'facebook', '_refResourceCollection': 'managed/facebook', 'uiConfig': { 'buttonImage': 'test3' } }
            ]
        });

        let providers = wrapper.vm.setProviders();

        expect(providers[0]).to.have.property('_refResourceCollection');
        expect(providers[1]).to.not.have.property('_refResourceCollection');
        expect(providers[2]).to.have.property('_refResourceCollection');
        expect(providers[3]).to.not.have.property('_refResourceCollection');
    });
});
