<template>
    <div class="d-flex container-fluid p-0">
        <b-container fluid v-show="!showSelfService">
            <div class="d-flex">
                <div class="m-auto fr-center-card p-0">
                    <bounce-loader :color="loadingColor"></bounce-loader>
                </div>
            </div>
        </b-container>

        <div v-show="showSelfService" class="d-flex container-fluid p-0">
            <fr-center-card :showLogo="true" v-if="selfServiceType !== 'localAutoLogin'" class="m-auto fr-small-screen">
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
                    <router-link action="" to="login">{{$t('pages.selfservice.registration.signIn')}}</router-link>
                </b-card-footer>
            </fr-center-card>
        </div>
    </div>
</template>

<script>
    import AllInOneRegistration from '../selfservice/registration/AllInOneRegistration';
    import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min.js';
    import Captcha from '../selfservice/common/Captcha';
    import CenterCard from '@/components/utils/CenterCard';
    import Consent from '../selfservice/registration/Consent';
    import emailValidation from '../selfservice/registration/EmailValidation';
    import kbaSecurityAnswerDefinitionStage from '../selfservice/registration/KBASecurityAnswerDefinitionStage.vue';
    import idmUserDetails from '../selfservice/registration/UserDetails';
    import SelfserviceAPI from '../selfservice/mixins/SelfserviceAPIMixin';
    import styles from '../../scss/main.scss';
    import TermsAndConditions from '../selfservice/registration/TermsAndConditions';
    import _ from 'lodash';

    const customTitleComponents = [
        'captcha',
        'consent',
        'emailValidation',
        'kbaSecurityAnswerDefinitionStage',
        'termsAndConditions'
    ];

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
            TermsAndConditions
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
                                this.progressiveProfileCheck(userDetails, () => {
                                    this.displayNotification('success', this.$t('pages.selfservice.registration.createdAccount'));
                                    window.history.pushState('', '', window.location.pathname);
                                    this.$router.push('/profile');
                                });
                            })
                            .catch(() => {
                                window.history.pushState('', '', window.location.pathname);
                                this.$router.push('/login');
                            });
                    } else {
                        this.autoLogin(details.additions.credentialJwt);
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
                    this.selfServiceType = type;
                    this.showSelfService = true;
                }
            },
            apiErrorCallback (error) {
                let errorMessage = this.findPolicyError(error.response);

                this.showSelfService = true;

                /* istanbul ignore next */
                this.displayNotification('error', errorMessage);

                // clean up any queryParams from the url
                this.$router.push('/registration');
                // reload the form
                this.loadData();
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
            autoLogin: function (jwt) {
                /* istanbul ignore next */
                var loginServiceInstance = this.getRequestService({
                        headers: {
                            'X-OpenIDM-Jwt': jwt,
                            'X-OpenIDM-NoSession': false,
                            'X-OpenIDM-Password': null,
                            'X-OpenIDM-Username': null
                        },
                        timeout: 5000
                    }),
                    idmInstance = this.getRequestService({
                        headers: this.getAnonymousHeaders()
                    });

                /* istanbul ignore next */
                idmInstance.post('/authentication?_action=logout').then(() => {
                    loginServiceInstance.post('/authentication?_action=login').then((userDetails) => {
                        // Check for progressive profiling.
                        this.progressiveProfileCheck(userDetails, () => {
                            this.displayNotification('success', this.$t('pages.selfservice.registration.createdAccount'));
                            this.$router.push('/');
                        });
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
