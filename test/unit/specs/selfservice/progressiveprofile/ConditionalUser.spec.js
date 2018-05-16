import Vue from 'vue';
import ConditionalUser from '@/components/selfservice/progressiveprofile/ConditionalUser';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import sinon from 'sinon';
import { mount } from '@vue/test-utils';

describe('ConditionalUser.vue', () => {
    ConditionalUser.components['fr-floating-label-input'] = sinon.stub();

    var mountWrapper = () => {
        return mount(ConditionalUser, {
            i18n,
            propsData: {
                advanceStage: null,
                selfServiceDetails: {
                    requirements: {
                        uiConfig: {
                            displayName: 'TESTNAME',
                            purpose: 'TESTPURPOSE',
                            buttonText: 'TESTBUTTONTEXT'
                        },
                        attributes: [
                            {
                                name: 'aBooleanAttribute',
                                isRequired: true,
                                schema: {
                                    type: 'boolean'
                                }
                            }
                        ]
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

    it('ConditionalUser component loaded and isSingleBooleanForm is set', () => {
        const wrapper = mountWrapper();

        expect(wrapper.name()).to.equal('Conditional-User');
        expect(wrapper.vm.isSingleBooleanForm).to.equal(true);
    });

    it('ConditionalUser getData() returns proper output when attributes are collected', () => {
        var expectedResult = {
                attributes: {
                    aBooleanAttribute: true,
                    postalAddress: 'TESTPOSTALADDRESS'
                }
            },
            actualResult;

        const wrapper = mountWrapper();

        wrapper.vm.saveDetails.postalAddress = 'TESTPOSTALADDRESS';

        actualResult = wrapper.vm.getData();
        expect(JSON.stringify(actualResult)).to.equal(JSON.stringify(expectedResult));
    });

    it('ConditionalUser emits advanceStage() on save', (done) => {
        const wrapper = mountWrapper();

        // Trigger a save to verify after is valid promise
        wrapper.vm.save();

        expect(wrapper.emitted().advanceStage.length).to.equal(1);
        done();
    });

    it('ConditionalUser save() sends proper input to advanceStage when terms are updated', (done) => {
        var expectedResult = {
            accept: 'true'
        };

        const wrapper = mountWrapper();

        wrapper.vm.selfServiceDetails.requirements.terms = 'Some fake terms';

        wrapper.vm.save();

        expect(JSON.stringify(wrapper.emitted().advanceStage[0])).to.equal(JSON.stringify([expectedResult]));
        done();
    });
});
