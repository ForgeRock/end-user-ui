import Vue from 'vue';
import ConditionalUser from '@/components/selfservice/progressiveprofile/ConditionalUser';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import Sinon from 'sinon';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('ConditionalUser.vue', () => {
    ConditionalUser.components['fr-floating-label-input'] = Sinon.stub();

    var mountWrapper = () => {
        return shallowMount(ConditionalUser, {
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

    Vue.use(BootstrapVue);

    it('ConditionalUser component loaded', () => {
        const wrapper = mountWrapper();

        expect(wrapper.name()).to.equal('Conditional-User');
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

    it('ConditionalUser getData() returns proper output when an attribute is set to empty string', () => {
        var expectedResult = {
                attributes: {
                    aBooleanAttribute: true,
                    postalAddress: null
                }
            },
            actualResult;

        const wrapper = mountWrapper();

        wrapper.vm.saveDetails.postalAddress = '';

        actualResult = wrapper.vm.getData();
        expect(JSON.stringify(actualResult)).to.equal(JSON.stringify(expectedResult));
    });

    it('ConditionalUser emits advanceStage() on save', () => {
        const wrapper = mountWrapper();

        // Trigger a save to verify after is valid promise
        wrapper.vm.save();

        expect(wrapper.emitted().advanceStage.length).to.equal(1);
    });

    it('ConditionalUser save() sends proper input to advanceStage when submit button is pressed', () => {
        var expectedResult = {
            attributes: {
                aBooleanAttribute: true
            }
        };

        const wrapper = mountWrapper();

        wrapper.vm.save({});

        expect(JSON.stringify(wrapper.emitted().advanceStage[0])).to.equal(JSON.stringify([expectedResult, true]));
    });

    it('ConditionalUser save() sends proper input to advanceStage when there is an empty requirements object', () => {
        var expectedResult = {};

        const wrapper = mountWrapper();

        wrapper.vm.save(true);

        expect(JSON.stringify(wrapper.emitted().advanceStage[0])).to.equal(JSON.stringify([expectedResult, true]));
    });

    it('ConditionalUser save() sends proper input to advanceStage when terms are updated', () => {
        var expectedResult = {
            accept: 'true'
        };

        const wrapper = mountWrapper();

        wrapper.vm.selfServiceDetails.requirements.terms = 'Some fake terms';

        wrapper.vm.save();

        expect(JSON.stringify(wrapper.emitted().advanceStage[0])).to.equal(JSON.stringify([expectedResult, true]));
    });

    it('ConditionalUser sets isSingleBooleanForm properly', () => {
        const wrapper = mountWrapper();

        wrapper.vm.handleBooleanValues();

        expect(wrapper.vm.isSingleBooleanForm).to.equal(true);

        // add another boolean property
        wrapper.vm.selfServiceDetails.requirements.attributes.push({
            name: 'anotherBooleanAttribute',
            isRequired: true,
            schema: {
                type: 'boolean'
            }
        });

        wrapper.vm.handleBooleanValues();

        expect(wrapper.vm.isSingleBooleanForm).to.equal(false);
    });
});
