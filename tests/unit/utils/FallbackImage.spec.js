import Vue from 'vue';
import FallbackImage from '@/components/utils/FallbackImage';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import sinon from 'sinon';

sinon.stub(FallbackImage, 'mounted');

describe('utils/FallbackImage.vue', () => {
    Vue.use(BootstrapVue);

    it('should display an image when "imageFound"', () => {
        const wrapper = mount(FallbackImage);

        wrapper.setData({ imageFound: true });

        expect(wrapper.find('img').isVisible()).to.equal(true);
        expect(wrapper.find('i').exists()).to.equal(false);
    });

    it('should display an icon when not "imageFound"', () => {
        const wrapper = mount(FallbackImage);

        wrapper.setData({ imageFound: false });

        expect(wrapper.find('i').isVisible()).to.equal(true);
        expect(wrapper.find('img').exists()).to.equal(false);
    });
});
