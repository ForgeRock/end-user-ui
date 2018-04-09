<template>
    <b-container class="fr-registration h-100 px-0" fluid>
        <div class="h-100 d-flex">
            <div class="m-auto fr-selfservice-signin">
                <b-card class="fr-registration-card border-xs-0 border-sm">
                    <b-img class="fr-logo mb-3 mt-2" src="static/image/fr-logomark.svg" fluid :alt="$t('common.form.logo')" />
                    <h3 class="font-weight-bold mb-4">{{$t("pages.selfservice.registration.signUp")}}</h3>

                    <component ref="selfServiceStage" v-if="selfServiceType !== null && selfServiceType !=='parameters'"
                               :is="selfServiceType"
                               :selfServiceDetails="selfServiceDetails"
                               @saveSelfService="saveSelfService">
                    </component>
                    <bounce-loader v-else :color="loadingColor"></bounce-loader>
                </b-card>
            </div>
        </div>
    </b-container>
</template>

<script>
    import styles from '../../scss/main.scss';
    import AllInOneRegistration from '../selfservice/registration/AllInOneRegistration';
    import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min.js';
    import idmUserDetails from '../selfservice/registration/UserDetails';
    import TermsAndConditions from '../selfservice/registration/TermsAndConditions';
    import Consent from '../selfservice/registration/Consent';

    export default {
        name: 'Registration',
        components: {
            AllInOneRegistration,
            BounceLoader,
            TermsAndConditions,
            idmUserDetails,
            Consent
        },
        data: function () {
            return {
                selfServiceType: null,
                selfServiceDetails: null,
                loadingColor: styles.baseColor
            };
        },
        mounted: function () {
            this.loadData();
        },
        methods: {
            loadData: function () {
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
                    })
                    .catch((error) => {
                        /* istanbul ignore next */
                        this.$notify({
                            group: 'IDMMessages',
                            type: 'error',
                            title: 'Registration Error',
                            text: error.response.data.message
                        });
                    });
            },
            setRegistrationComponent: function (type, details) {
                this.selfServiceDetails = details;

                if (type === 'parameters') {
                    this.selfServiceType = null;

                    this.saveSelfService({
                        'input': {}
                    });
                } else {
                    this.selfServiceType = type;
                }
            },
            saveSelfService: function (data) {
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

                this.setRegistrationComponent(null, null);

                /* istanbul ignore next */
                selfServiceInstance.post('/selfservice/registration?_action=submitRequirements', saveData)
                    .then((selfServiceDetails) => {
                        if (selfServiceDetails.data.type === 'localAutoLogin') {
                            this.$notify({
                                group: 'IDMMessages',
                                type: 'success',
                                title: 'User Creation',
                                text: 'Successfully created user.'
                            });
                            this.autoLogin(selfServiceDetails.data.additions.credentialJwt);
                        } else {
                            this.setRegistrationComponent(selfServiceDetails.data.type, selfServiceDetails.data);
                        }
                    })
                    .catch((error) => {
                        /* istanbul ignore next */
                        this.$notify({
                            group: 'IDMMessages',
                            type: 'error',
                            title: this.$t('common.errors.registrationError'),
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
                    idmInstance = this.getRequestService();

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
                            title: this.$t('common.errors.authenticationError'),
                            text: error.response.data.message
                        });
                    });
                });
            }
        }
    };
</script>

<style scoped lang="scss">
    @import "../../scss/main.scss";

    .fr-registration {
        .fr-logo {
            width: 37px;
        }
    }

    // TODO remove when center card component merged
    // Selfservice form and card
    .fr-selfservice-signin {
        width: 100%;
        margin: 0 auto;
        @include media-breakpoint-between(sm, xl) {
            max-width: 420px;
            padding: 40px 0;
        }

        .card {
            border: none;
            @include media-breakpoint-between(sm, xl) {
                margin: 0;
                border-radius: $border-radius;
                border: $border-width solid $border-color;
            }
        }
    }
</style>