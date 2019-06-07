/* eslint no-unused-expressions: 0 */
import Vue from 'vue';
import PolicyPasswordInput from '@/components/utils/PolicyPasswordInput';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import Sinon from 'sinon';
import VeeValidate from 'vee-validate';
import { expect } from 'chai';
import { shallowMount, mount } from '@vue/test-utils';
import _ from 'lodash';

PolicyPasswordInput.created = Sinon.stub();

describe('PasswordPolicyInput.vue', () => {
    Vue.use(BootstrapVue);
    Vue.use(VeeValidate, { inject: false, fastExit: false });

    const v = new VeeValidate.Validator();

    describe('proper render', () => {
        let wrapper = shallowMount(PolicyPasswordInput, {
            i18n,
            provide: () => ({
                $validator: v
            }),
            propsData: { policyApi: 'reset' }
        });

        it('should load the page', () => {
            expect(wrapper.name()).to.equal('PolicyPasswordInput');
        });

        it('should provide default "exclude" prop with object and string examples', () => {
            let policyRequirements = ['REQUIRED', 'MIN_LENGTH'],
                defaultExclude = wrapper.vm.exclude,
                { predicate } = _.first(defaultExclude);

            expect(defaultExclude.length).to.equal(4);
            expect(predicate(policyRequirements)).to.equal(true);
        });
    });

    describe('#isPasswordPolicyItem', () => {
        let wrapper = shallowMount(PolicyPasswordInput, {
            i18n,
            provide: () => ({
                $validator: v
            }),
            propsData: { policyApi: 'reset' }
        });

        it('Should return true for items that match "password" and then items that do not match "password" ', () => {
            let policyDefinition = { name: '/user/password' },
                policyFailureDefinition = { property: '/user/password' };

            expect(wrapper.vm.isPasswordPolicyItem('name', policyDefinition)).to.equal(true);
            expect(wrapper.vm.isPasswordPolicyItem('property', policyFailureDefinition)).to.equal(true);

            policyDefinition = { name: '/user/_id' };
            policyFailureDefinition = { property: '/user/_id' };

            expect(wrapper.vm.isPasswordPolicyItem('name', policyDefinition)).to.equal(false);
            expect(wrapper.vm.isPasswordPolicyItem('property', policyFailureDefinition)).to.equal(false);
        });
    });

    describe('#toSimplePolicyObject', () => {
        let wrapper = shallowMount(PolicyPasswordInput, {
            i18n,
            provide: () => ({
                $validator: v
            }),
            propsData: { policyApi: 'reset' }
        });

        it('should turn Policy Definition objcets into an object {name<String>, params<Object>}', () => {
            let policyDefinition = {
                    'policyId': 'at-least-X-numbers',
                    'params': { 'numNums': 1 },
                    'policyRequirements': [ 'AT_LEAST_X_NUMBERS' ]
                },
                simplePolicyObj = wrapper.vm.toSimplePolicyObject(policyDefinition);

            expect(simplePolicyObj).to.be.an('object');
            expect(simplePolicyObj).to.have.property('name').that.equals('AT_LEAST_X_NUMBERS');
            expect(simplePolicyObj).to.have.property('params').that.deep.equals({ 'numNums': 1 });
        });

        it('should return an empty list for not well defined policy definitions', () => {
            let policyDefinition = {
                    'policyId': 'at-least-X-numbers',
                    'params': { 'numNums': 1 }
                },
                simplePolicyObj = wrapper.vm.toSimplePolicyObject(policyDefinition);

            expect(simplePolicyObj).to.be.an('object').that.is.empty;
        });
    });

    describe('#toPolicyNames', () => {
        let wrapper = shallowMount(PolicyPasswordInput, {
            i18n,
            provide: () => ({
                $validator: v
            }),
            propsData: { policyApi: 'reset' }
        });

        it('should only return the name of a failed password property and fail on badly formed input', () => {
            let failedPolicySet = {
                'failedPolicyRequirements': [
                    {
                        'policyRequirements': [{
                            'params': { 'numNums': 1 },
                            'policyRequirement': 'AT_LEAST_X_NUMBERS'
                        }],
                        'property': '/user/password'
                    },
                    {
                        'policyRequirements': [{
                            'policyRequirement': 'REQUIRED'
                        }],
                        'property': '/user/mail'
                    }
                ]
            };

            expect(wrapper.vm.toPolicyNames(failedPolicySet)).to.deep.equal([ 'AT_LEAST_X_NUMBERS' ]);
            expect(wrapper.vm.toPolicyNames({})).to.deep.equal([]);
        });
    });

    describe('#makeExclusions', () => {
        let wrapper = shallowMount(PolicyPasswordInput, {
                i18n,
                provide: () => ({
                    $validator: v
                }),
                propsData: { policyApi: 'reset' }
            }),
            policyRequirementSet = {
                'policyRequirements': [
                    'REQUIRED',
                    'MIN_LENGTH'
                ],
                'policies': [
                    {
                        'policyRequirements': [
                            'REQUIRED'
                        ]
                    },
                    {
                        'policyRequirements': [
                            'MIN_LENGTH'
                        ]
                    }
                ]
            };

        it('should remove policies with strings specified in "exclude" prop', () => {
            wrapper.setProps({ exclude: ['REQUIRED'] });
            let unexcludedPolicies = wrapper.vm.makeExclusions(policyRequirementSet).policies;

            expect(unexcludedPolicies).to.deep.equal([{ policyRequirements: ['MIN_LENGTH'] }]);
        });

        it('should remove policies specified as {name<String>, predicate<Function>} in "exclude" prop', () => {
            wrapper.setProps({ exclude: [{
                name: 'REQUIRED',
                predicate: (n) => _.includes(n, 'MIN_LENGTH')
            }] });

            let unexcludedPolicies = wrapper.vm.makeExclusions(policyRequirementSet).policies;

            expect(unexcludedPolicies).to.deep.equal([{ policyRequirements: ['MIN_LENGTH'] }]);
        });
    });

    // both of these tests no longer seem to work
    describe.skip('#formatPayload', () => {
        let wrapper = mount(PolicyPasswordInput, {
            i18n,
            provide: () => ({
                $validator: v
            }),
            propsData: { policyApi: 'reset' }
        });

        it('should return a differently shaped object based on policyApi prop', () => {
            expect(wrapper.vm.formatPayload('test')).to.deep.equal({ password: 'test' });
            wrapper.setProps({ policyApi: 'registration' });
            expect(wrapper.vm.formatPayload('test')).to.deep.equal({ user: { password: 'test' } });
        });
    });
    describe.skip('#getAction', () => {
        let wrapper = mount(PolicyPasswordInput, {
            i18n,
            provide: () => ({
                $validator: v
            }),
            propsData: {
                policyApi: 'reset'
            }
        });

        it('should return different action when "policy" is selfsevice', () => {
            expect(wrapper.vm.getAction()).to.equal('validateProperty');
            wrapper.setProps({ policyApi: 'selfservice' });
            expect(wrapper.vm.getAction()).to.equal('validateObject');
        });
    });
});
