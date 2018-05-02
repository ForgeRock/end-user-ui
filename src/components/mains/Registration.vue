<template>
    <fr-center-card :showLogo="true">
        <div slot="center-card-header">
            <h2 class="h2">{{$t("pages.selfservice.registration.signUp")}}</h2>
            <p class='text-center mb-0'>{{$t('pages.selfservice.registration.signUpMsg')}}</p>
        </div>

        <b-card-body slot="center-card-body">
            <component ref="selfServiceStage" v-show="showSelfService"
                       :is="selfServiceType"
                       :selfServiceDetails="selfServiceDetails"
                       @saveSelfService="saveSelfService">
            </component>
            <bounce-loader v-show="showSelfService === false" :color="loadingColor"></bounce-loader>
        </b-card-body>

        <b-card-footer slot="center-card-footer">
            {{$t('pages.selfservice.registration.haveAccount')}}
            <a href="#/login">
                {{$t('pages.selfservice.registration.signIn')}}
            </a>
        </b-card-footer>
    </fr-center-card>
</template>

<script>
    import styles from '../../scss/main.scss';
    import AllInOneRegistration from '../selfservice/registration/AllInOneRegistration';
    import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min.js';
    import idmUserDetails from '../selfservice/registration/UserDetails';
    import TermsAndConditions from '../selfservice/registration/TermsAndConditions';
    import Consent from '../selfservice/registration/Consent';
    import CenterCard from '@/components/utils/CenterCard';
    import kbaSecurityAnswerDefinitionStage from '../selfservice/registration/KBASecurityAnswerDefinitionStage.vue';

    export default {
        name: 'Registration',
        components: {
            AllInOneRegistration,
            BounceLoader,
            TermsAndConditions,
            idmUserDetails,
            Consent,
            'fr-center-card': CenterCard,
            kbaSecurityAnswerDefinitionStage
        },
        data () {
            return {
                selfServiceType: null,
                selfServiceDetails: null,
                loadingColor: styles.baseColor,
                showSelfService: false
            };
        },
        mounted () {
            this.loadData();
        },
        methods: {
            loadData () {
                // TODO Abstract to more reusable location
                /* istanbul ignore next */
                var selfServiceInstance = this.getRequestService({
                    headers: {
                        'X-OpenIDM-NoSession': true,
                        'X-OpenIDM-Password': 'anonymous',
                        'X-OpenIDM-Username': 'anonymous'
                    }
                });
                /* istanbul ignore next */
                selfServiceInstance.get('/selfservice/registration')
                    .then((selfServiceDetails) => {
                        this.setRegistrationComponent(selfServiceDetails.data.type, selfServiceDetails.data);
                        this.showSelfService = true;
                    })
                    .catch((error) => {
                        /* istanbul ignore next */
                        this.showSelfService = false;
                        this.$notify({
                            group: 'IDMMessages',
                            type: 'error',
                            text: error.response.data.message
                        });
                    });
            },
            setRegistrationComponent (type, details) {
                this.selfServiceDetails = details;

                if (type === 'parameters') {
                    this.selfServiceType = null;
                    this.showSelfService = false;

                    this.saveSelfService({
                        'input': {}
                    });
                } else {
                    this.selfServiceType = type;
                    this.showSelfService = true;
                }
            },
            saveSelfService (data) {
                /* istanbul ignore next */
                var selfServiceInstance = this.getRequestService({
                        headers: {
                            'X-OpenIDM-NoSession': true,
                            'X-OpenIDM-Password': 'anonymous',
                            'X-OpenIDM-Username': 'anonymous'
                        }
                    }),
                    saveData = {
                        input: {}
                    };

                /* istanbul ignore next */
                if (this.selfServiceDetails.token) {
                    saveData.token = this.selfServiceDetails.token;
                }

                saveData.input = data;
                this.showSelfService = false;

                /* istanbul ignore next */
                selfServiceInstance.post('/selfservice/registration?_action=submitRequirements', saveData)
                    .then((selfServiceDetails) => {
                        if (selfServiceDetails.data.type === 'localAutoLogin') {
                            this.$notify({
                                group: 'IDMMessages',
                                type: 'success',
                                text: this.$t('pages.selfservice.registration.createdAccount')
                            });
                            this.autoLogin(selfServiceDetails.data.additions.credentialJwt);
                        } else {
                            this.setRegistrationComponent(selfServiceDetails.data.type, selfServiceDetails.data);
                        }
                    })
                    .catch((error) => {
                        this.showSelfService = true;

                        /* istanbul ignore next */
                        this.$notify({
                            group: 'IDMMessages',
                            type: 'error',
                            text: error.response.data.message
                        });
                    });
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
                        headers: {
                            'X-OpenIDM-NoSession': true,
                            'X-OpenIDM-Password': 'anonymous',
                            'X-OpenIDM-Username': 'anonymous'
                        }
                    });

                /* istanbul ignore next */
                idmInstance.post('/authentication?_action=logout').then(() => {
                    loginServiceInstance.post('/authentication?_action=login').then(() => {
                        this.$router.push('/');
                    })
                    .catch((error) => {
                        /* istanbul ignore next */
                        this.$notify({
                            group: 'IDMMessages',
                            type: 'error',
                            text: error.response.data.message
                        });
                    });
                });
            }
        }
    };
</script>