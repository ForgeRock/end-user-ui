import Vue from 'vue';
import Unshare from '@/components/uma/Unshare';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { mount } from '@vue/test-utils';

describe('Unshare.vue', () => {
    Vue.use(BootstrapVue);

    let propsData = {
        resource: {
            _id: '12345',
            name: 'test resource',
            resourceOwnerId: 'alice',
            scopes: ['view', 'comment', 'download'],
            policy: {
                permissions: [{
                    subject: 'bob',
                    scopes: ['download']
                }]
            }
        },
        newScopes: {},
        newShare: false
    };

    it('Resources page loaded', () => {
        const wrapper = mount(Unshare, {
            i18n,
            propsData: propsData
        });

        expect(wrapper.name()).to.equal('Unshare');
    });

    it('Emits "unshareResource" event', () => {
        const wrapper = mount(Unshare, {
            i18n,
            propsData: propsData
        });

        wrapper.vm.unshare('12345');

        Vue.nextTick(() => {
            expect(wrapper.emitted('unshareResource').length).to.equal(1);
        });
    });
});
