import Vue from 'vue';
import FloatingLabelInput from '@/components/utils/CenterCard';
import BootstrapVue from 'bootstrap-vue';
import i18n from '@/i18n';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('CenterCard.vue', () => {
    Vue.use(BootstrapVue);

    it('Center Card component loaded without header images', () => {
        const wrapper = shallowMount(FloatingLabelInput, { i18n });

        expect(wrapper.name()).to.equal('Center-Card');
        expect(wrapper.contains('.fr-logo')).to.equal(false);
    });

    it('Center Card component loaded with header images', () => {
        const wrapper = shallowMount(FloatingLabelInput, {
            i18n,
            propsData: {
                showLogo: true
            }
        });

        expect(wrapper.contains('.fr-logo')).to.equal(true);
    });
});
