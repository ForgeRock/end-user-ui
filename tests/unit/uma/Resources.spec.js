import Vue from 'vue';
import Resources from '@/components/uma/Resources';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('Sharing.vue', () => {
    Vue.use(BootstrapVue);

    it('Resources page loaded', () => {
        const wrapper = shallowMount(Resources, {
            i18n
        });

        expect(wrapper.name()).to.equal('Resources');
    });

    it('Emits "renderShareModal" event', () => {
        const wrapper = shallowMount(Resources, {
            i18n
        });

        wrapper.vm.renderShareModal();

        Vue.nextTick(() => {
            expect(wrapper.emitted('renderShareModal').length).to.equal(1);
        });
    });

    it('Emits "renderUnshareModal" event', () => {
        const wrapper = shallowMount(Resources, {
            i18n
        });

        wrapper.vm.renderUnshareModal();

        Vue.nextTick(() => {
            expect(wrapper.emitted('renderUnshareModal').length).to.equal(1);
        });
    });

    it('Toggles grid view', () => {
        const wrapper = shallowMount(Resources, {
            i18n,
            propsData: {
                viewgrid: false
            }
        });
        expect(wrapper.vm.viewgrid).to.equal(false);

        wrapper.vm.toggleGrid();

        Vue.nextTick(() => {
            expect(wrapper.vm.viewgrid).to.equal(true);
        });
    });
});
