import SocialButtons from '@/components/utils/SocialButtons';
import i18n from '@/i18n';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';

describe('SocialButtons.vue', () => {
    var sandbox = null;

    beforeEach(function () {
        sandbox = Sinon.createSandbox();
        sandbox.stub(SocialButtons, 'mounted').callsFake(() => {});
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('Social Buttons loaded', () => {
        const wrapper = shallowMount(SocialButtons, {
            i18n
        });

        expect(wrapper.name()).to.equal('Social-Buttons');
    });

    it('Displays a buttons', () => {
        const wrapper = shallowMount(SocialButtons, {
            i18n
        });

        wrapper.setData({ 'providers': [{
            'provider': 'wordpress',
            'uiConfig': {
                'iconBackground': '#0095cc',
                'iconClass': 'fa-wordpress',
                'iconFontColor': 'white',
                'buttonClass': 'fa-wordpress',
                'buttonDisplayName': 'WordPress',
                'buttonCustomStyle': 'background-color: #0095cc; border-color: #0095cc; color:white;',
                'buttonCustomStyleHover': 'background-color: #0095cc; border-color: #0095cc; color:white;'
            }
        }] });

        wrapper.vm.hover(0, 'test');
        expect(wrapper.contains('.btn')).to.equal(true);
    });
});
