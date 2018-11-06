import Vue from 'vue';
import KBASecurityAnswerDefinitionStage from '@/components/selfservice/registration/KBASecurityAnswerDefinitionStage';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

describe('KBASecurityAnswerDefinitionStage.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);
    Vue.use(VeeValidate, { inject: false, fastExit: false });

    const i18n = new VueI18n({
            locale: 'en',
            messages: translations
        }),
        v = new VeeValidate.Validator();

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
        wrapper = mount(KBASecurityAnswerDefinitionStage, mountOptions);
    });

    it('KBASecurityAnswerDefinitionStage component loaded', () => {
        expect(wrapper.name()).to.equal('KBA-Security-Answer-Definition-Stage');
    });

    it('calls `getData` on child component', () => {
        let spy = sinon.spy();
        wrapper.vm.$refs.kbaFormGroup = { getData: spy };
        wrapper.vm.getData();
        expect(spy.called).to.be.ok; // eslint-disable-line
    });
});
