import Vue from 'vue';
import GenericProcess from '@/components/dashboard/widgets/workflow/GenericProcess';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('GenericProcess.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('Generic process widget loaded', () => {
        const wrapper = mount(GenericProcess, {
            i18n,
            propsData: {
                workflowDetails: [{
                    'id': 'request',
                    'name': 'Request',
                    'readable': true,
                    'required': true,
                    'type': {
                        'mimeType': 'text/plain',
                        'name': 'string'
                    },
                    'variableExpression': null,
                    'variableName': null,
                    'writable': true
                },
                {
                    'id': 'fake',
                    'name': 'fake',
                    'readable': true,
                    'required': true,
                    'type': {
                        'mimeType': 'text/plain',
                        'name': 'number'
                    },
                    'variableExpression': null,
                    'variableName': null,
                    'writable': true
                },
                {
                    'id': 'justification',
                    'name': 'Justification',
                    'readable': true,
                    'required': true,
                    'type': {
                        'mimeType': 'text/plain',
                        'name': 'boolean'
                    },
                    'variableExpression': null,
                    'variableName': null,
                    'writable': true
                }],
                id: 'test'
            }
        });

        expect(wrapper.name()).to.equal('Generic-Process');

        wrapper.vm.resetForm();

        expect(wrapper.vm.formValues.fake).to.equal(0);
    });
});
