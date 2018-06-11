import Vue from 'vue';
import Unshare from '@/components/uma/Unshare';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { shallow } from '@vue/test-utils';

describe('Unshare.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

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
        const wrapper = shallow(Unshare, {
            i18n,
            propsData: propsData
        });

        expect(wrapper.name()).to.equal('Unshare');
    });

    it('Emits "unshareResource" event', () => {
        const wrapper = shallow(Unshare, {
            i18n,
            propsData: propsData
        });

        wrapper.vm.unshare('12345');

        Vue.nextTick(() => {
            expect(wrapper.emitted('unshareResource').length).to.equal(1);
        });
    });
});
