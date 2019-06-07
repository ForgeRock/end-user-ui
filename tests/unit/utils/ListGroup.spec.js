import Vue from 'vue';
import ListGroup from '@/components/utils/ListGroup';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('ListGroup.vue', () => {
    Vue.use(BootstrapVue);

    it('List Group component loaded', () => {
        const wrapper = shallowMount(ListGroup);

        expect(wrapper.name()).to.equal('List-Group');
    });
});
