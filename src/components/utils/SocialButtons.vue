<template>
    <div v-if="providers.length">
        <button class="btn btn-lg btn-light btn-block fr-btn-social mb-3"
                type="button"
                v-for="(provider, index) in filteredProviders"
                :key="index"
                :style="socialButtonStyles[index]"
                @click="goToIDP(provider.provider)"
                @mouseover="hover(index, provider.uiConfig.buttonCustomStyleHover)"
                @mouseout="hover(index, provider.uiConfig.buttonCustomStyle)">

            <img v-if="provider.uiConfig.buttonImage" :src="'static/' + provider.uiConfig.buttonImage"/>
            <i v-else :class="['fab fa-lg', provider.uiConfig.iconClass]"></i>

            <span class="ml-1" v-if="signin">{{$t("pages.selfservice.social.signIn")}} {{provider.uiConfig.buttonDisplayName}}</span>
            <span class="ml-1" v-else>{{$t("pages.selfservice.social.signUp")}} {{provider.uiConfig.buttonDisplayName}}</span>
        </button>

        <div class="fr-form-break text-muted mb-3" v-if="this.filterProviders.length === 0">
            <div></div>
            <div>{{$t("pages.selfservice.social.or")}}</div>
            <div></div>
        </div>
    </div>
</template>

<script>
import _ from 'lodash';

/**
* @description Controlling component for initializing oauth process for login and registration.
* This component controls the displaying of the buttons based on which providers are configured.
*
* @fires GET authentication - Returns a list of available configured providers.
* @fires POST identityProviders?_action=getAuthRedirect - Generates the redirect URL used to go to the selected provider and begin the Oauth authentication process
*
**/
export default {
    name: 'Social-Buttons',
    props: {
        'signin': {
            type: Boolean,
            default: false
        },
        'filterProviders': {
            type: Array,
            default: () => { return []; }
        },
        'filterProvidersObjects': {
            type: Array,
            default: () => { return []; }
        }
    },
    computed: {
        filteredProviders () {
            return _.filter(this.providers, (provider) => { return provider.uiConfig; });
        }
    },
    data () {
        return {
            providers: [],
            socialButtonStyles: []
        };
    },
    mounted () {
        /* istanbul ignore next */
        this.loadData();
    },
    methods: {
        loadData () {
            /* istanbul ignore next */
            const socialInstance = this.getRequestService({
                headers: this.getAnonymousHeaders()
            });
                /* istanbul ignore next */
            socialInstance.get('/authentication')
                .then((response) => {
                    this.providers = _.filter(response.data.providers || [], (provider, index) => {
                        if (this.filterProviders.length === 0 || _.includes(this.filterProviders, provider.provider)) {
                            return true;
                        }
                    });

                    if (this.providers.length) {
                        _.each(this.providers, (provider, index) => {
                            /* If this is fullStack we need to tell the app to use oauth
                                   headers on authenticated requests after being logged inspect
                                   then immediately redirect to am's login. */
                            if (provider.provider === 'OPENAM' && this.providers.length === 1) {
                                if (!window.location.search && this.signin === true) {
                                    this.goToIDP('OPENAM');
                                } else {
                                    this.providers.splice((index - 1), 1);
                                }
                            } else {
                                this.$set(this.socialButtonStyles, index, provider.uiConfig.buttonCustomStyle);
                            }

                            if (provider.provider === 'salesforce') {
                                provider.uiConfig.iconClass = 'fa-salesforce';
                            }
                        });
                    } else if (this.filterProvidersObjects.length) {
                        this.providers = this.filterProvidersObjects;
                    }
                })
                .catch((error) => {
                    this.displayNotification('error', error.response.data.message);
                });
        },
        hover (index, style) {
            this.$set(this.socialButtonStyles, index, style);
        },
        goToIDP (provider) {
            /* istanbul ignore next */
            const socialInstance = this.getRequestService({
                headers: this.getAnonymousHeaders()
            });

            /* istanbul ignore next */
            socialInstance.post('/authentication?_action=logout').then(() => {
                /* istanbul ignore next */
                socialInstance.post('/identityProviders?_action=getAuthRedirect', {
                    'provider': provider,
                    'landingPage': `${window.location.protocol}/${window.location.host}/#/login?_oauthReturn=true&provider=${provider}&gotoURL=%23`
                })
                    .then((response) => {
                        localStorage.setItem('dataStoreToken', response.data.token);
                        window.location.href = response.data.redirect;
                    })
                    .catch((error) => {
                        /* istanbul ignore next */
                        this.displayNotification('error', error.response.data.message);
                    });
            })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification('error', error.response.data.message);
                });
        }
    }
};
</script>

<style type="scss" scoped>
    .fr-btn-social img{
        max-width: 21px;
        margin-right: 5px;
    }
</style>
