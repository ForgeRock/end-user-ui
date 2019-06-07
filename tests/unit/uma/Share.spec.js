import Vue from 'vue';
import Share from '@/components/uma/Share';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { mount } from '@vue/test-utils';
import Sinon from 'sinon';

describe('Sharing.vue', () => {
    Vue.use(BootstrapVue);

    let propsData = {
        resource: {
            _id: '12345',
            name: 'test resource',
            resourceOwnerId: 'alice',
            scopes: ['view', 'comment', 'download'],
            policy: {
                permissions: [{
                    subject: 'bob',
                    scopes: ['download']
                }]
            }
        },
        newScopes: {},
        newShare: false
    };

    it('Resources page loaded', () => {
        const wrapper = mount(Share, {
            i18n,
            propsData: propsData
        });

        expect(wrapper.name()).to.equal('Share');
    });

    it('Emits "modifyResource" event', () => {
        const wrapper = mount(Share, {
            i18n,
            propsData: propsData
        });

        wrapper.vm.shareResource();

        Vue.nextTick(() => {
            expect(wrapper.emitted('modifyResource').length).to.equal(1);
        });
    });

    it('Emits "modifyResource" event', () => {
        const wrapper = mount(Share, {
            i18n,
            propsData: propsData
        });

        wrapper.vm.modifyResource('bob', 'view');

        Vue.nextTick(() => {
            expect(wrapper.emitted('modifyResource').length).to.equal(1);
        });
    });

    it('Emits "shareResource" event', () => {
        const propsData = {
                resource: {
                    _id: '12345',
                    name: 'test resource',
                    resourceOwnerId: 'alice',
                    scopes: ['view', 'comment', 'download']
                },
                newScopes: {},
                newShare: false
            },
            wrapper = mount(Share, {
                i18n,
                propsData: propsData
            });

        wrapper.vm.shareResource();

        Vue.nextTick(() => {
            expect(wrapper.emitted('shareResource').length).to.equal(1);
        });
    });

    it('Emits "renderUnshareModal" event', () => {
        const wrapper = mount(Share, {
            i18n,
            propsData: propsData
        });

        wrapper.vm.unshareAll();

        Vue.nextTick(() => {
            expect(wrapper.emitted('renderUnshareModal').length).to.equal(1);
        });
    });

    it('Emits "unshareOne" event', () => {
        const wrapper = mount(Share, {
            i18n,
            propsData: propsData
        });

        wrapper.vm.unshareOne('testUser');

        Vue.nextTick(() => {
            expect(wrapper.emitted('modifyResource').length).to.equal(1);
        });
    });

    it('Validates resource', () => {
        const wrapper = mount(Share, {
                i18n,
                propsData: propsData
            }),
            spy = Sinon.spy();

        wrapper.setMethods({ resetModal: spy, displayNotification: spy });
        wrapper.vm.validateResource();

        // eslint-disable-next-line
        expect(spy.called).to.be.ok;
    });

    it('Validates resource without policy', () => {
        let propsData = {
            resource: {
                _id: '12345',
                name: 'test resource',
                resourceOwnerId: 'alice',
                scopes: ['view', 'comment', 'download']
            },
            newScopes: {},
            newShare: false
        };

        const wrapper = mount(Share, {
            i18n,
            propsData: propsData
        });

        wrapper.vm.validateResource();

        Vue.nextTick(() => {
            expect(wrapper.emitted()).to.be.an('object');
        });
    });

    it('Prevents sharing with same user', () => {
        const wrapper = mount(Share, {
                i18n,
                propsData: propsData
            }),
            spy = Sinon.spy();

        wrapper.setData({ newShare: 'bob' });
        wrapper.setMethods({ resetModal: spy, displayNotification: spy });
        wrapper.vm.validateResource();

        // eslint-disable-next-line
        expect(spy.called).to.be.ok;
    });

    it('Calls "shareResource" if resource is valid', () => {
        const wrapper = mount(Share, {
                i18n,
                propsData: propsData
            }),
            spy = Sinon.spy();

        wrapper.setData({ newShare: 'steve' });
        wrapper.setMethods({ shareResource: spy });
        wrapper.vm.validateResource();

        // eslint-disable-next-line
        expect(spy.called).to.be.ok;
    });

    it('Calls "shareResource" if resouce is shared for the first time', () => {
        const propsData = {
                resource: {
                    _id: '12345',
                    name: 'test resource',
                    resourceOwnerId: 'alice',
                    scopes: ['view', 'comment', 'download']
                },
                newScopes: {},
                newShare: false
            },
            wrapper = mount(Share, {
                i18n,
                propsData: propsData
            }),
            spy = Sinon.spy();

        wrapper.setData({ newShare: 'bob' });
        wrapper.setMethods({ shareResource: spy });
        wrapper.vm.validateResource();

        // eslint-disable-next-line
        expect(spy.called).to.be.ok;
    });
});
