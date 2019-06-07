import Vue from 'vue';
import KBAUpdate from '@/components/selfservice/progressiveprofile/KBAUpdate';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import Sinon from 'sinon';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

describe('KBAUpdate.vue', () => {
    Vue.use(BootstrapVue);
    Vue.use(VeeValidate, { inject: false, fastExit: false });

    const v = new VeeValidate.Validator();

    let wrapper;

    beforeEach(() => {
        wrapper = shallowMount(KBAUpdate, {
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
        });
    });

    it('KBAUpdate component loaded', () => {
        expect(wrapper.name()).to.equal('KBA-Update-Stage');
    });

    it('calls `getData` on child component', () => {
        let spy = Sinon.spy();
        wrapper.vm.$refs.kbaFormGroup = { getData: spy };
        wrapper.vm.getData();
        expect(spy.called).to.be.ok; // eslint-disable-line
    });
});
