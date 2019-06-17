<template>
    <div class="h-100">
        <b-container fluid class="h-100 px-0" v-show="!showSelfService">
            <div class="h-100 d-flex">
                <div class="m-auto fr-center-card">
                    <bounce-loader :color="loadingColor"></bounce-loader>
                </div>
            </div>
        </b-container>

        <div v-show="showSelfService">
            <fr-center-card :showLogo="true" v-if="selfServiceType !== 'localAutoLogin'">
                <div slot="center-card-header">
                    <h2 v-show="title.length > 0" class="h2">{{title}}</h2>
                    <p v-show="subtitle.length > 0" class='text-center mb-0'>{{subtitle}}</p>
                </div>

                <b-card-body slot="center-card-body">
                    <component ref="selfServiceStage" v-show="showSelfService"
                               :is="selfServiceType"
                               :selfServiceDetails="selfServiceDetails"
                               @advanceStage="advanceStage">
                    </component>
                </b-card-body>

                <b-card-footer slot="center-card-footer">
                    {{$t('pages.selfservice.registration.haveAccount')}}
                    <router-link action="" :to="{name: 'Login'}">{{$t('pages.selfservice.registration.signIn')}}</router-link>
                </b-card-footer>
            </fr-center-card>
        </div>
    </div>
</template>

<script>
import _ from 'lodash';
import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min.js';
import styles from '@/scss/main.scss';
import CenterCard from '@/components/utils/CenterCard';
import AllInOneRegistration from '@/components/selfservice/registration/AllInOneRegistration';
import Captcha from '@/components/selfservice/common/Captcha';
import Consent from '@/components/selfservice/registration/Consent';
import emailValidation from '@/components/selfservice/registration/EmailValidation';
import GenericSelfService from '@/components/selfservice/common/GenericSelfService';
import idmUserDetails from '@/components/selfservice/registration/UserDetails';
import kbaSecurityAnswerDefinitionStage from '@/components/selfservice/registration/KBASecurityAnswerDefinitionStage.vue';
import SelfserviceAPI from '@/components/selfservice/mixins/SelfserviceAPIMixin';
import TermsAndConditions from '@/components/selfservice/registration/TermsAndConditions';

const customTitleComponents = [
    'captcha',
    'consent',
    'emailValidation',
    'kbaSecurityAnswerDefinitionStage',
    'termsAndConditions'
];

/**
 * @description Selfservice controlling component for registering a resource (e.g. a new user). Makes use of selfservice-registration.json config file.
 *
 * @mixin - selfservice/mixins/SelfserviceAPIMixin.vue
 *
 * @fires POST authentication?_action=login - Uses localAutoLogin stage that sets a JWT after a successful registration to start a user session.
 * Alternatively if registration came through social, login will use the data store token to go forward with login after a successful registration.
 * @fires POST authentication?_action=logout - Ends current user session
 */
export default {
    name: 'Registration',
    components: {
        'fr-center-card': CenterCard,
        AllInOneRegistration,
        BounceLoader,
        Captcha,
        Consent,
        emailValidation,
        idmUserDetails,
        kbaSecurityAnswerDefinitionStage,
        TermsAndConditions,
        GenericSelfService
    },
    props: ['clientToken'],
    mixins: [
        SelfserviceAPI
    ],
    data () {
        return {
            selfServiceType: null,
            selfServiceDetails: null,
            loadingColor: styles.baseColor,
            showSelfService: false,
            apiType: 'registration',
            clientTokenUsed: false
        };
    },
    computed: {
        title () {
            if (_.includes(customTitleComponents, this.selfServiceType)) {
                return this.$t(`pages.selfservice.registration.stageTitle.${this.selfServiceType}`);
            } else {
                return this.$t('pages.selfservice.registration.signUp');
            }
        },
        subtitle () {
            if (_.includes(customTitleComponents, this.selfServiceType)) {
                return this.$t(`pages.selfservice.registration.stageSubtitle.${this.selfServiceType}`);
            } else {
                return this.$t('pages.selfservice.registration.signUpMsg');
            }
        }
    },
    mounted () {
        if (this.$route.params.queryParams) {
            /* istanbul ignore next */
            // queryParams come from the link emailed to the user for the emailValidation stage
            // This stops the flicker by hiding everything in the center-card
            this.selfServiceType = 'localAutoLogin';
            this.advanceStage(this.parseQueryParams(this.$route.params.queryParams));
        } else {
            this.loadData();
        }
    },
    methods: {
        setChildComponent (type, details) {
            this.selfServiceDetails = details;

            if (type === 'parameters') {
                this.selfServiceType = null;
                this.showSelfService = false;

                this.advanceStage({
                    'input': {}
                });
            } else if (this.clientToken && !this.clientTokenUsed) {
                this.advanceStage({
                    'clientToken': this.clientToken,
                    'oauthRegister': 'true'
                });
                this.clientTokenUsed = true;
            } else if (details.type === 'localAutoLogin') {
                if (_.has(details, 'additions.oauthLogin') && details.additions.oauthLogin) {
                    /* istanbul ignore next */
                    const socialLoginInstance = this.getRequestService({
                        headers: {
                            'X-OpenIDM-NoSession': 'false',
                            'X-OpenIDM-OAuth-Login': 'true',
                            'X-OpenIDM-DataStoreToken': this.clientToken,
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });

                    /* istanbul ignore next */
                    socialLoginInstance.post('/authentication?_action=login')
                        .then((userDetails) => {
                            this.displayNotification('success', this.$t('pages.selfservice.registration.createdAccount'));

                            if (details.additions.successUrl && details.additions.successUrl.length > 0) {
                                window.location = details.additions.successUrl;
                            } else {
                                this.progressiveProfileCheck(userDetails, () => {
                                    window.history.pushState('', '', window.location.pathname);
                                    this.$router.push('/');
                                });
                            }
                        })
                        .catch(() => {
                            window.history.pushState('', '', window.location.pathname);
                            this.$router.push('/login');
                        });
                } else {
                    this.autoLogin(details.additions.credentialJwt, details.additions.successUrl);
                }
            } else if (type === 'openAMAutoLogin' && details.status) {
                if (_.has(details, 'additions.successUrl')) {
                    // If there is a provided success url then follow it.
                    /* istanbul ignore next */
                    window.location.href = details.additions.successUrl;
                } else {
                    // Otherwise, redirect to login and send success notification.
                    this.$router.push('/login');
                    /* istanbul ignore next */
                    this.displayNotification('success', this.$t('pages.selfservice.registration.createdAccount'));
                }
            } else {
                let stageCheck = false;

                _.each(this.$options.components, (value, key) => {
                    if (_.toLower(key) === _.toLower(type)) {
                        stageCheck = true;
                    }
                });

                if (stageCheck) {
                    this.selfServiceType = type;
                } else {
                    this.selfServiceType = 'GenericSelfService';
                }

                this.showSelfService = true;
            }
        },
        apiErrorCallback (error) {
            let errorMessage = this.findPolicyError(error.response);

            this.showSelfService = true;

            /* istanbul ignore next */
            this.displayNotification('error', errorMessage);

            // TODO Readd this if it is problematic not resetting all of registration on failure
            // clean up any queryParams from the url
            // this.$router.push('/registration');

            // reload the form
            // this.loadData();
        },
        findPolicyError (errorResponse) {
            let errorMessage = errorResponse.data.message,
                policyError = '';

            if (_.has(errorResponse, 'data.detail.failedPolicyRequirements')) {
                let policy = errorResponse.data.detail.failedPolicyRequirements[0];

                if (policy.policyRequirements.length > 0) {
                    policyError = this.$t(`common.policyValidationMessages.${policy.policyRequirements[0].policyRequirement}`, { property: policy.property });

                    errorMessage = `${errorMessage}: ${policyError}`;
                }
            }

            return errorMessage;
        },
        autoLogin: function (jwt, successUrl) {
            /* istanbul ignore next */
            var loginServiceInstance = this.getRequestService({
                    headers: {
                        'X-OpenIDM-Jwt': jwt,
                        'X-OpenIDM-NoSession': false,
                        'X-OpenIDM-Password': null,
                        'X-OpenIDM-Username': null
                    }
                }),
                idmInstance = this.getRequestService({
                    headers: this.getAnonymousHeaders()
                });

            /* istanbul ignore next */
            idmInstance.post('/authentication?_action=logout').then(() => {
                loginServiceInstance.post('/authentication?_action=login').then((userDetails) => {
                    this.displayNotification('success', this.$t('pages.selfservice.registration.createdAccount'));

                    if (successUrl && successUrl.length > 0) {
                        window.location = successUrl;
                    } else {
                        // Check for progressive profiling.
                        this.progressiveProfileCheck(userDetails, () => {
                            this.$router.push('/');
                        });
                    }
                })
                    .catch((error) => {
                        /* istanbul ignore next */
                        this.displayNotification('error', error.response.data.message);
                    });
            });
        }
    }
};
</script>
