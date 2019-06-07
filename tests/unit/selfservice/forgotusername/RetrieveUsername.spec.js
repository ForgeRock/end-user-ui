import Vue from 'vue';
import RetrieveUsername from '@/components/selfservice/forgotusername/RetrieveUsername';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('RetrieveUsername.vue', () => {
    var mountWrapper = () => {
        return shallowMount(RetrieveUsername, {
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
    Vue.use(BootstrapVue);

    it('RetrieveUsername component loaded', () => {
        const wrapper = mountWrapper();

        expect(wrapper.name()).to.equal('Retrieve-Username');
    });

    it('RetrieveUsername username displayed', () => {
        const wrapper = mountWrapper();

        expect(wrapper.html()).to.contain('<b>bjensen</b>');
    });

    it('RetrieveUsername username error displayed', () => {
        const wrapper = shallowMount(RetrieveUsername, {
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
