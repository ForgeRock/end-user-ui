import Vue from 'vue';
import i18n from '@/i18n';
import EditPassword from '@/components/profile/EditPassword';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import VeeValidate from 'vee-validate';
import Sinon from 'sinon';

describe.skip('EditPassword.vue', () => {
    let sandbox = null;

    const v = new VeeValidate.Validator(),
        applicationStore = {
            state: {
                workflow: false,
                passwordReset: false,
                usernameRecovery: false,
                registration: false
            }
        },
        userStore = {
            state: {
                managedResource: ''
            }
        };

    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.createSandbox();

        sandbox.stub(EditPassword, 'data').callsFake(function () {
            return {
                currentPassword: '',
                newPassword: '',
                loading: false,
                showNew: true,
                showCurrent: true,
                inputCurrent: 'password',
                inputNew: 'password',
                userId: ''
            };
        });

        sandbox.stub(EditPassword.methods, 'validate').callsFake(function () {
            return Promise.resolve(true);
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('PasswordReset page loaded', () => {
        const wrapper = shallowMount(EditPassword, {
            sync: true,
            provide: () => ({
                $validator: v
            }),
            mocks: {
                applicationStore,
                userStore
            },
            i18n
        });

        expect(wrapper.name()).to.equal('Edit-Password');
    });

    it('Incorrect password error', () => {
        const wrapper = shallowMount(EditPassword, {
            sync: true,
            provide: () => ({
                $validator: v
            }),
            mocks: {
                applicationStore,
                userStore
            },
            i18n
        });

        wrapper.vm.displayError({
            response: {
                status: 403
            }
        });

        expect(wrapper.vm.errors.all().length).to.equal(1);
    });

    it('revealNew method changes input state', () => {
        const wrapper = shallowMount(EditPassword, {
            sync: true,
            provide: () => ({
                $validator: v
            }),
            mocks: {
                applicationStore,
                userStore
            },
            i18n
        });

        wrapper.vm.revealNew();

        expect(wrapper.vm.inputNew).to.equal('text');
        expect(wrapper.vm.showNew).to.equal(false);

        wrapper.vm.revealNew();

        expect(wrapper.vm.inputNew).to.equal('password');
        expect(wrapper.vm.showNew).to.equal(true);
    });

    it('revealCurrent method changes input state', () => {
        const wrapper = shallowMount(EditPassword, {
            sync: true,
            provide: () => ({
                $validator: v
            }),
            mocks: {
                applicationStore,
                userStore
            },
            i18n
        });

        wrapper.vm.revealCurrent();

        expect(wrapper.vm.inputCurrent).to.equal('text');
        expect(wrapper.vm.showCurrent).to.equal(false);

        wrapper.vm.revealCurrent();

        expect(wrapper.vm.inputCurrent).to.equal('password');
        expect(wrapper.vm.showCurrent).to.equal(true);
    });

    describe('#resetComponent', () => {
        it('should reset data and visual elements', () => {
            const wrapper = shallowMount(EditPassword, {
                    sync: true,
                    provide: () => ({
                        $validator: v
                    }),
                    mocks: {
                        applicationStore,
                        userStore
                    },
                    i18n
                }),
                click = Sinon.spy();

            wrapper.vm.$refs = { cancel: { click } };
            wrapper.vm.resetComponent();

            expect(wrapper.vm.loading).to.equal(false);
            expect(wrapper.vm.currentPassword).to.equal('');
            expect(wrapper.vm.newPassword).to.equal('');
            expect(click.called).to.equal(true);
        });
    });

    describe('#onSavePassword', () => {
        it('should emit "patch" with payload and config', () => {
            const wrapper = shallowMount(EditPassword, {
                sync: true,
                provide: () => ({
                    $validator: v
                }),
                mocks: {
                    applicationStore,
                    userStore
                },
                i18n
            });

            wrapper.setData({ currentPassword: 'test current', newPassword: 'test new' });

            wrapper.setMethods({
                encodeRFC5987IfNecessary: function (s) {
                    return s;
                }
            });

            wrapper.vm.onSavePassword();

            return Vue.nextTick()
                .then(() => {
                    let patchEvent = wrapper.emitted().updateProfile,
                        [payload, config] = patchEvent[0];

                    expect(patchEvent).to.be.an('Array').with.property('length').that.equals(1);
                    expect(payload[0]).to.have.property('value').that.equals('test new');
                    expect(config).to.have.property('headers');
                    expect(config.headers).to.have.property('X-OpenIDM-Reauth-Password').that.equals('test current');
                });
        });
    });
});
