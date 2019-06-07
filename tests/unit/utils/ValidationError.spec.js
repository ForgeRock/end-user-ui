import Vue from 'vue';
import ValidationError from '@/components/utils/ValidationError';
import BootstrapVue from 'bootstrap-vue';
import _ from 'lodash';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('ValidationError.vue', () => {
    Vue.use(BootstrapVue);

    it('Validation Error component loaded', () => {
        const wrapper = shallowMount(ValidationError, {
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
