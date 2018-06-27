import Vue from 'vue';
import VueI18n from 'vue-i18n';
import EditPassword from '@/components/profile/EditPassword';
import BootstrapVue from 'bootstrap-vue';
import {shallow} from '@vue/test-utils';
import translations from '@/translations';
import VeeValidate from 'vee-validate';
import Sinon from 'sinon';

describe('EditPassword.vue', () => {
    let sandbox = null;

    const i18n = new VueI18n({
            locale: 'en',
            messages: translations
        }),
        v = new VeeValidate.Validator(),
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

    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.sandbox.create();

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
        const wrapper = shallow(EditPassword, {
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
        const wrapper = shallow(EditPassword, {
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
        const wrapper = shallow(EditPassword, {
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
        const wrapper = shallow(EditPassword, {
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
            const wrapper = shallow(EditPassword, {
                    provide: () => ({
                        $validator: v
                    }),
                    mocks: {
                        applicationStore,
                        userStore
                    },
                    i18n
                }),
                click = sinon.spy();

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
            const wrapper = shallow(EditPassword, {
                provide: () => ({
                    $validator: v
                }),
                mocks: {
                    applicationStore,
                    userStore
                },
                i18n
            });

            wrapper.setData({currentPassword: 'test current', newPassword: 'test new'});

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
