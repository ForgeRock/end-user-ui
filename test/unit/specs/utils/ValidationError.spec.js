import Vue from 'vue';
import ValidationError from '@/components/utils/ValidationError';
import BootstrapVue from 'bootstrap-vue';
import _ from 'lodash';
import { mount } from '@vue/test-utils';

describe('ValidationError.vue', () => {
    Vue.use(BootstrapVue);

    it('Validation Error component loaded', () => {
        const wrapper = mount(ValidationError, {
            propsData: {
                validatorErrors: {
                    has: _.noop,
                    first: _.noop
                },
                fieldName: 'test'
            }
        });

        expect(wrapper.name()).to.equal('Validation-Error');
    });
});
