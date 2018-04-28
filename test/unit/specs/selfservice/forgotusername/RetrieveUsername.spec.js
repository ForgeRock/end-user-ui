import Vue from 'vue';
import RetrieveUsername from '@/components/selfservice/forgotusername/RetrieveUsername';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('RetrieveUsername.vue', () => {
    var mountWrapper = () => {
        return mount(RetrieveUsername, {
            i18n,
            propsData: {
                apiType: 'username',
                advanceStage: null,
                selfServiceDetails: {
                    additions: {
                        userName: 'bjensen'
                    }
                }
            }
        });
    };
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('RetrieveUsername component loaded', () => {
        const wrapper = mountWrapper();

        expect(wrapper.name()).to.equal('Retrieve-Username');
    });

    it('RetrieveUsername username displayed', () => {
        const wrapper = mountWrapper();

        expect(wrapper.html()).to.contain('<b>bjensen</b>');
    });

    it('RetrieveUsername username error displayed', () => {
        const wrapper = mount(RetrieveUsername, {
            i18n,
            propsData: {
                advanceStage: null,
                selfServiceDetails: {
                    error: 'unable to find this user'
                }
            }
        });

        expect(wrapper.html()).to.contain('unable to find this user');
    });
});
