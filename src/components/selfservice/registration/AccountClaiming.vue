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

            <fr-social-buttons v-if="socialVerification" :filterProviders="providers" :filterProvidersObjects="providersObjects" signin></fr-social-buttons>

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
import styles from '@/scss/main.scss';
import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min.js';
import CenterCard from '@/components/utils/CenterCard';
import FloatingLabelInput from '@/components/utils/FloatingLabelInput';
import SelfserviceAPI from '@/components/selfservice/mixins/SelfserviceAPIMixin';
import SocialButtons from '@/components/utils/SocialButtons';

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
            providersObjects: [],
            mail: ''
        };
    },
    mixins: [
        SelfserviceAPI
    ],
    name: 'Account-Claiming',
    props: ['clientToken', 'originalToken', 'returnParams'],
    mounted () {
        if (localStorage.getItem('accountClaimingToken')) {
            let accountClaimingToken = localStorage.getItem('accountClaimingToken');

            localStorage.removeItem('accountClaimingToken');

            this.claimAccount(accountClaimingToken);
        } else {
            /* istanbul ignore next */
            this.loadData();
        }
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

            return this.$t('pages.selfservice.accountClaiming.socialDesc', { providers: providerList });
        }
    },
    methods: {
        claimAccount (accountClaimingToken) {
            let clientToken = this.clientToken;

            if (_.isString(accountClaimingToken)) {
                clientToken = accountClaimingToken;
            }
            /* istanbul ignore next */
            this.advanceStage({
                'clientToken': clientToken,
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
                if (this.returnParams) {
                    this.advanceStage({
                        'returnParams': this.returnParams
                    });
                } else {
                    this.advanceStage({});
                }
            } else if (type === 'socialUserClaim' && details.tag === 'initial') {
                this.advanceStage({
                    'clientToken': this.clientToken
                });
            } else if (type === 'socialUserClaim' && details.tag === 'verifyProfile') {
                this.mail = _.has(details, 'requirements.mail') ? details.requirements.mail : '';

                if (details.requirements.error) {
                    this.displayNotification('error', details.requirements.error.message);
                } else if (details.requirements.required.indexOf('password') !== -1) {
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
                        this.providersObjects = details.requirements.definitions.providers.items.oneOf;
                        this.socialVerification = true;
                    }
                }
            } else if ((type === 'localAutoLogin' || type === 'openAMAutoLogin') && _.isUndefined(details.additions.claimedProfile)) {
                if (sessionStorage.getItem('amSocialToken')) {
                    let tempToken = sessionStorage.getItem('amSocialToken');

                    this.$router.push({ name: 'Registration', params: { clientToken: tempToken } });
                } else {
                    this.$router.push({ name: 'Registration', params: { clientToken: this.clientToken } });
                }
            } else if (details.tag === 'end' && details.status.success) {
                const socialLoginInstance = this.getRequestService({
                    headers: {
                        'X-OpenIDM-NoSession': 'false',
                        'X-OpenIDM-OAuth-Login': 'true',
                        'X-OpenIDM-DataStoreToken': sessionStorage.getItem('amSocialToken') || this.clientToken,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                sessionStorage.removeItem('amSocialToken');

                socialLoginInstance.post('/authentication?_action=login')
                    .then((userDetails) => {
                        // Check for progressive profiling.
                        this.progressiveProfileCheck(userDetails, () => {
                            if (_.has(details, 'additions.successUrl') && !_.isEmpty(details.additions.successUrl)) {
                                window.location = details.additions.successUrl;
                            } else {
                                this.$router.push('/');
                            }
                            this.displayNotification('success', this.$t('pages.selfservice.accountClaiming.linked'));
                        });
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
