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

    it('creates patches array correctly', () => {
        const wrapper = mount(EditPersonalInfo, {
            provide: () => ({
                $validator: v
            }),
            i18n,
            mocks: {
                userStore
            }
        });

        let original = [{
                name: 'description',
                value: null
            }, {
                name: 'telephoneNumber',
                value: '123-456-7890'
            }, {
                name: 'city',
                value: 'Portland'
            }, {
                name: 'postalCode',
                value: null
            }],
            newForm = [{
                name: 'description',
                value: 'new description'
            }, {
                name: 'telephoneNumber',
                value: ''
            }, {
                name: 'city',
                value: 'Vancouver'
            }, {
                name: 'postalCode',
                value: null
            }],
            patches = wrapper.vm.createPatches(original, newForm);

        expect(patches.length).to.equal(3);
        expect(patches[0].operation).to.equal('add');
        expect(patches[0].field).to.equal('/description');
        expect(patches[0].value).to.equal('new description');
        expect(patches[1].operation).to.equal('remove');
        expect(patches[1].field).to.equal('/telephoneNumber');
        expect(patches[2].operation).to.equal('add');
        expect(patches[2].field).to.equal('/city');
        expect(patches[2].value).to.equal('Vancouver');
    });
});
