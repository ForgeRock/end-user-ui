import Vue from 'vue';
import KBASecurityAnswerDefinitionStage from '@/components/selfservice/registration/KBASecurityAnswerDefinitionStage';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import Sinon from 'sinon';

describe('KBASecurityAnswerDefinitionStage.vue', () => {
    Vue.use(BootstrapVue);
    Vue.use(VeeValidate, { inject: false, fastExit: false });

    const v = new VeeValidate.Validator();

    let wrapper,
        mountOptions = {
            provide: () => ({
                $validator: v
            }),
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        properties: {
                            kba: {
                                minItems: 4,
                                questions: [
                                    {
                                        question: {
                                            en: 'What\'s your favorite color?'
                                        },
                                        id: '1'
                                    },
                                    {
                                        question: {
                                            en: 'Who was your first employer?'
                                        },
                                        id: '2'
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        };

    beforeEach(() => {
        wrapper = shallowMount(KBASecurityAnswerDefinitionStage, mountOptions);
    });

    it('KBASecurityAnswerDefinitionStage component loaded', () => {
        expect(wrapper.name()).to.equal('KBA-Security-Answer-Definition-Stage');
    });

    it('calls `getData` on child component', () => {
        let spy = Sinon.spy();
        wrapper.vm.$refs.kbaFormGroup = { getData: spy };
        wrapper.vm.getData();
        expect(spy.called).to.be.ok; // eslint-disable-line
    });
});
