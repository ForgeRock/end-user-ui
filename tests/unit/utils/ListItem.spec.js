import Vue from 'vue';
import ListItem from '@/components/utils/ListItem';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('ListItem.vue', () => {
    Vue.use(BootstrapVue);

    it('List Group component loaded', () => {
        const wrapper = shallowMount(ListItem);

        expect(wrapper.name()).to.equal('List-Item');
    });
});
