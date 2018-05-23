<template>
    <b-container fluid class="h-100 px-0" v-if="!showSelfService">
        <div class="h-100 d-flex">
            <div class="m-auto fr-center-card">
                <bounce-loader :color="loadingColor"></bounce-loader>
            </div>
        </div>
    </b-container>

    <div v-else>
        <fr-center-card :showLogo="true" v-if="selfServiceType !== 'localAutoLogin'">
            <div slot="center-card-header">
                <h2 class="h2">{{$t("pages.selfservice.registration.signUp")}}</h2>
                <p class='text-center mb-0'>{{$t('pages.selfservice.registration.signUpMsg')}}</p>
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
                <router-link action="" to="Login">{{$t('pages.selfservice.registration.signIn')}}</router-link>
            </b-card-footer>
        </fr-center-card>
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
                            .then(() => {
                                this.displayNotification('success', this.$t('pages.selfservice.registration.createdAccount'));
                                window.history.pushState('', '', window.location.pathname);
                                this.$router.push('/profile');
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
                this.showSelfService = true;

                /* istanbul ignore next */
                this.displayNotification('error', error.response.data.message);
                // clean up any queryParams from the url
                this.$router.push('/registration');
                // reload the form
                this.loadData();
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
                        if (
                            _.has(userDetails, 'data.authorization.requiredProfileProcesses') &&
                            userDetails.data.authorization.requiredProfileProcesses.length > 0
                        ) {
                            let profileProcess = userDetails.data.authorization.requiredProfileProcesses[0].split('/')[1];
                            this.$router.push(`/profileCompletion/${profileProcess}`);
                        } else {
                            this.displayNotification('success', this.$t('pages.selfservice.registration.createdAccount'));
                            this.$router.push('/');
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