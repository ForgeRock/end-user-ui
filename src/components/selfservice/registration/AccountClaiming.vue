<template>
    <b-container fluid class="h-100 px-0" v-if="!passwordVerification && !socialVerification">
        <div class="h-100 d-flex">
            <div class="m-auto fr-center-card">
                <bounce-loader :color="loadingColor"></bounce-loader>
            </div>
        </div>
    </b-container>

    <fr-center-card :showLogo="true" v-else>
        <div slot="center-card-header">
            <h2 class="h2">{{$t("pages.selfservice.accountClaiming.title")}}</h2>
            <span v-if="passwordVerification" v-html="$t('pages.selfservice.accountClaiming.passwordDesc', {account: mail})"></span>
            <span v-if="socialVerification">{{socialDescription}}</span>
        </div>

        <b-card-body slot="center-card-body">
            <fr-floating-label-input v-if="passwordVerification"
                                     v-model="password"
                                     :label="$t('pages.login.password')"
                                     :reveal="true"
                                     type="password"
                                     fieldName="password"></fr-floating-label-input>

            <fr-social-buttons v-if="socialVerification" :filterProviders="providers" signin></fr-social-buttons>

            <button v-if="passwordVerification"
                    v-on:click="claimAccount"
                    class="btn btn-lg btn-primary btn-block mb-3"
                    type="button">{{$t("pages.login.signIn")}}</button>
        </b-card-body>

        <b-card-footer slot="center-card-footer">
            <router-link action="" to="login">{{$t("pages.selfservice.accountClaiming.return")}}</router-link>
        </b-card-footer>
    </fr-center-card>
</template>

<script>
    import _ from 'lodash';
    import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min.js';
    import CenterCard from '@/components/utils/CenterCard';
    import FloatingLabelInput from '@/components/utils/FloatingLabelInput';
    import SelfserviceAPI from '../../selfservice/mixins/SelfserviceAPIMixin';
    import SocialButtons from '@/components/mains/SocialButtons';
    import styles from '../../../scss/main.scss';

    export default {
        components: {
            BounceLoader,
            'fr-center-card': CenterCard,
            'fr-floating-label-input': FloatingLabelInput,
            'fr-social-buttons': SocialButtons
        },
        data () {
            return {
                apiType: 'socialUserClaim',
                loadingColor: styles.baseColor,
                selfServiceDetails: {},
                password: '',
                passwordVerification: false,
                socialVerification: false,
                providers: [],
                mail: ''
            };
        },
        mixins: [
            SelfserviceAPI
        ],
        name: 'Account-Claiming',
        props: ['clientToken', 'originalToken'],
        mounted () {
            /* istanbul ignore next */
            this.loadData();
        },
        computed: {
            socialDescription () {
                let numProviders = this.providers.length,
                    providerList = '';

                _.each(this.providers, (provider, index) => {
                    if (numProviders === 1) {
                        providerList += _.upperFirst(provider);
                    } else if (index < numProviders - 2) {
                        providerList += `${_.upperFirst(provider)}, `;
                    } else if (index < numProviders - 1) {
                        providerList += `${_.upperFirst(provider)} `;
                    } else {
                        providerList += ` ${this.$t('pages.selfservice.social.or')} ${_.upperFirst(provider)}`;
                    }
                });

                return this.$t('pages.selfservice.accountClaiming.socialDesc', {providers: providerList});
            }
        },
        methods: {
            claimAccount () {
                /* istanbul ignore next */
                this.advanceStage({
                    'clientToken': this.clientToken,
                    'password': this.password
                });
            },
            apiErrorCallback (error) {
                /* istanbul ignore next */
                this.$router.push('/login');
                /* istanbul ignore next */
                this.displayNotification('error', error.response.data.message);
            },
            setChildComponent (type, details) {
                /* istanbul ignore next */
                this.selfServiceDetails = details;
                /* istanbul ignore next */
                if (type === 'parameters') {
                    this.advanceStage({});
                } else if (type === 'socialUserClaim' && details.tag === 'initial') {
                    this.advanceStage({
                        'clientToken': this.clientToken
                    });
                } else if (type === 'socialUserClaim' && details.tag === 'verifyProfile') {
                    this.mail = _.has(details, 'requirements.mail') ? details.requirements.mail : '';
                    if (details.requirements.required.indexOf('password') !== -1) {
                        // You can get into this usecase by
                        // having a manually registered account with matching email and a password set
                        this.passwordVerification = true;
                    } else {
                        if (this.clientToken && this.originalToken) {
                            this.advanceStage({
                                'clientToken': this.originalToken
                            });
                        } else {
                            localStorage.setItem('accountClaimingToken', this.clientToken);
                            this.providers = _.map(details.requirements.definitions.providers.items.oneOf, 'provider');
                            this.socialVerification = true;
                        }
                    }
                } else if (type === 'localAutoLogin' && _.isUndefined(details.additions.claimedProfile)) {
                    this.$router.push({name: 'Registration', params: {clientToken: this.clientToken}});
                } else if (details.tag === 'end' && details.status.success) {
                    const socialLoginInstance = this.getRequestService({
                        headers: {
                            'X-OpenIDM-NoSession': 'false',
                            'X-OpenIDM-OAuth-Login': 'true',
                            'X-OpenIDM-DataStoreToken': this.clientToken,
                            'X-Requested-With': 'XMLHttpRequest'
                        }
                    });

                    socialLoginInstance.post('/authentication?_action=login')
                        .then(() => {
                            this.$router.push('/profile');
                            this.displayNotification('success', this.$t('pages.selfservice.accountClaiming.linked'));
                        })
                        .catch((error) => {
                            this.$router.push('/login');
                            this.displayNotification('error', error.response.data.message);
                        });
                } else {
                    this.$router.push('/login');
                    this.displayNotification('error', this.$t('pages.selfservice.accountClaiming.error'));
                }
            }
        }
    };
</script>

<style scoped></style>