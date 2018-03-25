<template>
    <b-container class="fr-registration">
        <b-row align-h="center" class="fr-registration-row">
            <b-col cols="5" align-self="center">
                <b-card class="fr-registration-card">
                    <b-img class="fr-logo mb-4 mt-2" src="static/image/forgerock-base-logo.png" fluid :alt="$t('common.form.logo')" />
                    <h3 class="font-weight-bold mb-4">{{$t("pages.selfservice.registration.signUp")}}</h3>

                    <component ref="selfServiceStage" v-if="selfServiceType !== null && selfServiceType !=='parameters'" :is="selfServiceType" :selfServiceDetails="selfServiceDetails"></component>

                    <bounce-loader v-else :color="loadingColor"></bounce-loader>

                    <b-button v-show="selfServiceType !== null && selfServiceType !=='parameters'" @click="save" :block="true" variant="primary">
                        {{$t("common.form.submit")}}
                    </b-button>
                </b-card>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
    import styles from '../../scss/main.scss';
    import AllInOneRegistration from '../selfservice/registration/AllInOneRegistration';
    import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min.js';
    import idmUserDetails from '../selfservice/registration/UserDetails';
    import TermsAndConditions from '../selfservice/registration/TermsAndConditions';

    export default {
        name: 'Registration',
        components: {
            AllInOneRegistration,
            BounceLoader,
            TermsAndConditions,
            idmUserDetails
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

                    this.save();
                } else {
                    this.selfServiceType = type;
                }
            },
            save: function () {
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
                    },
                    validationCheck,
                    currentStage = this.$refs.selfServiceStage;

                /* istanbul ignore next */
                if (this.selfServiceDetails.token) {
                    saveData.token = this.selfServiceDetails.token;
                }

                /* istanbul ignore next */
                if (currentStage && currentStage.getData && currentStage.isValid) {
                    validationCheck = currentStage.isValid();
                    saveData.input = currentStage.getData();
                } else {
                    validationCheck = Promise.resolve();
                }

                /* istanbul ignore next */
                validationCheck.then(() => {
                    selfServiceInstance.post('/selfservice/registration?_action=submitRequirements', saveData)
                        .then((selfServiceDetails) => {
                            if (selfServiceDetails.data.type === 'localAutoLogin') {
                                this.$notify({
                                    group: 'IDMMessages',
                                    type: 'success',
                                    title: 'User Creation',
                                    text: 'Successfully created user.'
                                });

                                this.setRegistrationComponent(null, null);

                                this.autoLogin(selfServiceDetails.data.additions.credentialJwt);
                            } else {
                                this.setRegistrationComponent(selfServiceDetails.data.type, selfServiceDetails.data);
                            }
                        })
                        .catch((error) => {
                            // todo Fallback when error message undefined
                            /* istanbul ignore next */
                            this.$notify({
                                group: 'IDMMessages',
                                type: 'error',
                                title: this.$t('common.errors.registrationError'),
                                text: error.response.data.message
                            });
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
        height: 100%;

        .fr-logo {
            width: 52px;
            height: 52px;
        }

        .fr-registration-row {
            height: 100%;
        }
    }
</style>