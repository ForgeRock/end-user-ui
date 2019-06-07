import Vue from 'vue';
import EditResource from '@/components/access/EditResource';
import i18n from '@/i18n';
import { expect } from 'chai';
import BootstrapVue from 'bootstrap-vue';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';

describe('EditResource.vue', () => {
    var sandbox = null;

    Vue.use(BootstrapVue);

    const $route = {
        path: '/test',
        meta: {},
        params: {
            resourceName: 'test',
            resourceType: 'test',
            resourceId: 'test'
        }
    };

    beforeEach(function () {
        sandbox = Sinon.createSandbox();

        sandbox.stub(EditResource, 'mounted').callsFake(function () {});
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('EditResource page loaded', () => {
        const wrapper = shallowMount(EditResource, {
            i18n,
            stubs: {
                'router-link': true
            },
            mocks: {
                $route
            }
        });

        expect(wrapper.name()).to.equal('Edit-Resource');
    });

    it('Format display data', () => {
        const wrapper = shallowMount(EditResource, {
            i18n,
            stubs: {
                'router-link': true
            },
            mocks: {
                $route
            }
        });

        let schema = {
                icon: 'fa-test',
                order: ['country', 'userName', 'sn', 'email', 'contractor'],
                required: ['userName'],
                properties: {
                    userName: {
                        type: 'string',
                        title: 'Username'
                    },
                    sn: {
                        type: 'string',
                        title: 'Last Name'
                    },
                    email: {
                        type: 'string',
                        title: 'Email'
                    },
                    contractor: {
                        type: 'boolean',
                        title: 'Contractor'
                    },
                    country: {
                        type: 'string',
                        title: 'Country'
                    }
                }
            },
            privilege = {
                UPDATE: {
                    allowed: true,
                    properties: ['userName', 'contractor', 'sn', 'email']
                },
                DELETE: {
                    allowed: true
                },
                VIEW: {
                    allowed: true,
                    properties: ['userName', 'country', 'sn', 'email']
                }
            },
            resourceDetails = {
                userName: 'test',
                email: 'test@test.com'
            };

        wrapper.vm.generateDisplay(schema, privilege, resourceDetails);

        expect(wrapper.vm.icon).to.equal('fa-test');
        expect(wrapper.vm.formFields['contractor']).to.equal(false);
        // make sure the view and update properties are merged together and in the correct order
        expect(wrapper.vm.displayProperties.length).to.equal(5);
        expect(wrapper.vm.displayProperties[0].key).to.equal('country');
    });

    it('Password reveal correctly', () => {
        const wrapper = shallowMount(EditResource, {
            i18n,
            stubs: {
                'router-link': true
            },
            mocks: {
                $route
            }
        });

        expect(wrapper.vm.passwordInputType).to.equal('password');

        wrapper.vm.revealNew();

        expect(wrapper.vm.passwordInputType).to.equal('text');

        wrapper.vm.revealNew();

        expect(wrapper.vm.passwordInputType).to.equal('password');
    });
});
