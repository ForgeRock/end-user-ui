<template>
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
        mixins: [
            SelfserviceAPI
        ],
        data () {
            return {
                selfServiceType: null,
                selfServiceDetails: null,
                loadingColor: styles.baseColor,
                showSelfService: false,
                apiType: 'registration'
            };
        },
        mounted () {
            /* istanbul ignore next */
            // queryParams come from the link emailed to the user for the emailValidation stage
            if (this.$route.params.queryParams) {
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
                } else {
                    this.selfServiceType = type;
                    this.showSelfService = true;
                }
            },
            apiErrorCallback (error) {
                this.showSelfService = true;

                /* istanbul ignore next */
                this.$notify({
                    group: 'IDMMessages',
                    type: 'error',
                    text: error.response.data.message
                });
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
                        headers: {
                            'X-OpenIDM-NoSession': true,
                            'X-OpenIDM-Password': 'anonymous',
                            'X-OpenIDM-Username': 'anonymous'
                        }
                    });

                /* istanbul ignore next */
                idmInstance.post('/authentication?_action=logout').then(() => {
                    loginServiceInstance.post('/authentication?_action=login').then(() => {
                        this.$notify({
                            group: 'IDMMessages',
                            type: 'success',
                            text: this.$t('pages.selfservice.registration.createdAccount')
                        });
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
