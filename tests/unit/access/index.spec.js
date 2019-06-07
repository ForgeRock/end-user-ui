import Vue from 'vue';
import ListResource from '@/components/access';
import BootstrapVue from 'bootstrap-vue';
import Sinon from 'sinon';
import i18n from '@/i18n';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';

describe('ListResource.vue', () => {
    var sandbox = null;

    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.createSandbox();

        sandbox.stub(ListResource, 'mounted').callsFake(function () {});
    });

    afterEach(function () {
        sandbox.restore();
    });

    const $route = {
        path: '/test',
        meta: {},
        params: {
            resourceName: 'test',
            resourceType: 'test'
        }
    };

    it('Access page loaded', () => {
        const wrapper = shallowMount(ListResource, {
            i18n,
            stubs: {
                'router-link': true
            },
            mocks: {
                $route
            }
        });

        expect(wrapper.name()).to.equal('Access');
    });

    it('Access resource URL generated', () => {
        const wrapper = shallowMount(ListResource, {
            i18n,
            stubs: {
                'router-link': true
            },
            mocks: {
                $route
            }
        });

        wrapper.setMethods({ loadGrid: () => {} });

        expect(wrapper.vm.buildGridUrl('test', ['test'], ['test'], 2)).to.equal('test/test?_queryFilter=test&_pageSize=10&_totalPagedResultsPolicy=EXACT&_sortKeys=test&_fields=test&_pagedResultsOffset=10');
    });

    it('Access sort column', () => {
        const wrapper = shallowMount(ListResource, {
            i18n,
            stubs: {
                'router-link': true
            },
            mocks: {
                $route
            }
        });

        wrapper.setMethods({ loadGrid: () => {} });

        expect(wrapper.vm.calculateSort(false, 'test')).to.equal('-test');
        expect(wrapper.vm.calculateSort(true, 'test')).to.equal('test');
    });

    it('Sorting change reset', () => {
        const wrapper = shallowMount(ListResource, {
            i18n,
            stubs: {
                'router-link': true
            },
            mocks: {
                $route
            }
        });

        wrapper.setMethods({ loadGrid: () => {} });
        wrapper.vm.sortingChanged({
            sortDesc: false,
            sortBy: 'test'
        });

        expect(wrapper.vm.currentPage).to.equal(1);
    });

    it('New search entered', () => {
        const wrapper = shallowMount(ListResource, {
            i18n,
            stubs: {
                'router-link': true
            },
            mocks: {
                $route
            }
        });

        wrapper.setMethods({ loadGrid: () => {} });
        wrapper.vm.search();

        expect(wrapper.vm.sortBy).to.equal(null);
        expect(wrapper.vm.currentPage).to.equal(1);
    });

    it('Generated query filter for search', () => {
        const wrapper = shallowMount(ListResource, {
            i18n,
            stubs: {
                'router-link': true
            },
            mocks: {
                $route
            }
        });

        expect(wrapper.vm.generateSearch('test', ['test1', 'test2'])).to.equal('test1+sw+"test"+OR+test2+sw+"test"');
        expect(wrapper.vm.generateSearch('', ['test1', 'test2'])).to.equal('true');
    });

    it('Clear search and sort', () => {
        const wrapper = shallowMount(ListResource, {
            i18n,
            stubs: {
                'router-link': true
            },
            mocks: {
                $route
            }
        });

        wrapper.setMethods({ loadGrid: () => {} });
        wrapper.vm.clear();

        expect(wrapper.vm.sortBy).to.equal(null);
        expect(wrapper.vm.currentPage).to.equal(1);
    });
});
