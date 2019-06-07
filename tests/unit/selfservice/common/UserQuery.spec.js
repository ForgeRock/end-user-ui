import Vue from 'vue';
import UserQuery from '@/components/selfservice/common/UserQuery';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('UserQuery.vue', () => {
    var mountWrapper = () => {
        return shallowMount(UserQuery, {
            i18n,
            propsData: {
                apiType: 'username',
                advanceStage: null,
                selfServiceDetails: null
            }
        });
    };
    Vue.use(BootstrapVue);

    it('UserQuery component loaded', () => {
        const wrapper = mountWrapper();

        expect(wrapper.name()).to.equal('User-Query');
    });

    it('UserQuery getData() returns proper output', () => {
        var expectedResult = {
            queryFilter: 'mail eq "test@test.com"'
        };
        const wrapper = mountWrapper();

        wrapper.vm.mail = 'test@test.com';

        expect(JSON.stringify(wrapper.vm.getData())).to.equal(JSON.stringify(expectedResult));
    });
});
