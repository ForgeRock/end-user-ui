import Vue from 'vue';
import Login from '@/components/Login';
import VueI18n from 'vue-i18n';
import moxios from 'moxios';
import axios from 'axios';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { shallow } from '@vue/test-utils';

describe('Login.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    beforeEach(function () {
        moxios.install();
    });

    afterEach(function () {
        moxios.uninstall();
    });

    const i18n = new VueI18n({
            locale: 'en',
            messages: translations
        }),
        applicationStore = {
            state: {
                workflow: false,
                passwordReset: false,
                usernameRecovery: false,
                registration: false
            }
        };

    it('Login page loaded', () => {
        const wrapper = shallow(Login, {
            i18n,
            mocks: {
                applicationStore
            },
            stubs: {
                'router-link': true
            }
        });

        expect(wrapper.name()).to.equal('Login');
    });

    it('Login shows error when given bad credentials', (done) => {
        const wrapper = shallow(Login, {
            i18n,
            stubs: {
                'router-link': true
            },
            mocks: {
                getAnonymousHeaders: () => { return {}; },
                applicationStore
            }
        });

        wrapper.setMethods({
            getRequestService: function (obj) {
                if (obj) {
                    return axios.create(obj);
                } else {
                    return axios.create({
                        baseURL: '/openidm',
                        timeout: 1000,
                        headers: {
                            'X-OpenIDM-Username': 'openidm-admin',
                            'X-OpenIDM-Password': 'openidm-admin',
                            'content-type': 'application/json'
                        }
                    });
                }
            },
            getAnonymousHeaders: function () {
                return {
                    'X-OpenIDM-NoSession': true,
                    'X-OpenIDM-Password': 'anonymous',
                    'X-OpenIDM-Username': 'anonymous'
                };
            },
            encodeRFC5987IfNecessary: function (s) {
                return s;
            }
        });

        wrapper.vm.submit();

        moxios.wait(function () {
            let request = moxios.requests.mostRecent();
            request.respondWith({
                status: 200,
                response: []
            }).then(function () {
                let request = moxios.requests.mostRecent();
                request.respondWith({
                    status: 401,
                    response: []
                }).then(function () {
                    expect(wrapper.vm.wrongPasswordSubmitted).to.equal(true);
                    done();
                });
            });
        });
    });
});
