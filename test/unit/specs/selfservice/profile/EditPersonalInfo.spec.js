import Vue from 'vue';
import EditPersonalInfo from '@/components/selfservice/profile/EditPersonalInfo';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

describe('EditPersonalInfo.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
            locale: 'en',
            messages: translations
        }),
        v = new VeeValidate.Validator(),
        userStore = {
            state: {
                givenName: '',
                sn: '',
                email: '',
                userName: '',
                profile: {
                    test: 'test'
                },
                schema: {
                    order: ['test'],
                    properties: {
                        test: {
                            viewable: true,
                            type: 'string',
                            title: 'test title'
                        }
                    },
                    required: []
                }
            }
        };

    it('EditPersonalInfo modal loaded', () => {
        const wrapper = mount(EditPersonalInfo, {
            provide: () => ({
                $validator: v
            }),
            i18n,
            mocks: {
                userStore
            }
        });

        expect(wrapper.name()).to.equal('Edit-Personal-Info');
        expect(wrapper.isVisible()).to.equal(true);
    });

    it('renders a title', () => {
        const wrapper = mount(EditPersonalInfo, {
            provide: () => ({
                $validator: v
            }),
            i18n,
            mocks: {
                userStore
            }
        });

        expect(wrapper.vm.title).to.equal('Edit your personal info');
    });

    it('TermsAndConditions validation', (done) => {
        const wrapper = mount(EditPersonalInfo, {
            provide: () => ({
                $validator: v
            }),
            i18n,
            mocks: {
                userStore
            }
        });

        wrapper.vm.isValid().then((response) => {
            expect(response).to.equal(true);

            done();
        });
    });

    it('hides modal on close', () => {
        const wrapper = mount(EditPersonalInfo, {
            provide: () => ({
                $validator: v
            }),
            i18n,
            mocks: {
                userStore
            }
        });

        wrapper.vm.hideModal();

        Vue.nextTick(() => {
            expect(wrapper.find('#userDetailsModal').isVisible()).to.equal(false);
        });
    });
});
