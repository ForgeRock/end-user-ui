import Vue from 'vue';
import CreateResource from '@/components/access/CreateResource';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { shallow } from '@vue/test-utils';
import ToggleButton from 'vue-js-toggle-button';

describe('CreateResource.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);
    Vue.use(ToggleButton);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('Create resource dialog loaded', () => {
        const wrapper = shallow(CreateResource, {
            i18n,
            propsData: {
                createProperties: [{
                    key: 'test',
                    type: 'string',
                    title: 'test'
                }],
                resourceName: 'testName',
                resourceType: 'testType'
            }
        });

        expect(wrapper.name()).to.equal('Create-Resource');
    });

    it('Display policy error message', () => {
        const wrapper = shallow(CreateResource, {
            i18n,
            propsData: {
                createProperties: [{
                    key: 'test',
                    type: 'string',
                    title: 'test'
                }],
                resourceName: 'testName',
                resourceType: 'testType'
            }
        });

        let error = wrapper.vm.findPolicyError({
            data: {
                detail: {
                    failedPolicyRequirements: [{
                        policyRequirements: [{
                            policyRequirement: 'VALID_EMAIL_ADDRESS_FORMAT',
                            property: 'test'
                        }]
                    }]
                },
                message: 'error'
            }
        });

        expect(error[0].msg).to.equal('Invalid email format (example@example.com)');
    });

    it('Clean dialog after close', () => {
        const wrapper = shallow(CreateResource, {
            i18n,
            propsData: {
                createProperties: [{
                    key: 'test',
                    type: 'string',
                    title: 'test'
                },
                {
                    key: 'boolTest',
                    type: 'boolean',
                    title: 'boolTest'
                }],
                resourceName: 'testName',
                resourceType: 'testType'
            }
        });

        wrapper.setData({
            formFields: {
                test: 'test',
                boolTest: true
            }
        });

        wrapper.vm.hideModal();

        expect(wrapper.vm.formFields.test).to.equal('');
        expect(wrapper.vm.formFields.boolTest).to.equal(false);
    });

    it('Password reveal correctly', () => {
        const wrapper = shallow(CreateResource, {
            i18n,
            propsData: {
                createProperties: [{
                    key: 'password',
                    type: 'string',
                    title: 'password',
                    encryption: {}
                }],
                resourceName: 'testName',
                resourceType: 'testType'
            }
        });

        expect(wrapper.vm.passwordInputType).to.equal('password');

        wrapper.vm.revealNew();

        expect(wrapper.vm.passwordInputType).to.equal('text');

        wrapper.vm.revealNew();

        expect(wrapper.vm.passwordInputType).to.equal('password');
    });

    it('Clean save data', () => {
        const wrapper = shallow(CreateResource, {
            i18n,
            propsData: {
                createProperties: [{
                    key: 'password',
                    type: 'string',
                    title: 'password',
                    encryption: {}
                }],
                resourceName: 'testName',
                resourceType: 'testType'
            }
        });

        let cleanData = wrapper.vm.cleanData({
            test: ''
        });

        expect(cleanData.test).to.equal(undefined);
    });
});
