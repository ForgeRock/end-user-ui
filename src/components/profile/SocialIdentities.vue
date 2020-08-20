<template>
    <div v-if="this.providers.length > 0">
        <fr-list-group :title="$t('pages.profile.socialSignIn.title')" :subtitle="$t('pages.profile.socialSignIn.subtitle')">
            <fr-list-item
                    v-for="(provider, index) in providers"
                    :key="index"
                    :collapsible="provider._id !== undefined"
                    :panelShown="false"
                    :hoverItem="true">
                <div slot="list-item-header" class="d-inline-flex w-100">
                    <div class="flex-grow-1">
                        <b-img v-if="provider.uiConfig.buttonImage" :src="'static/' + provider.uiConfig.buttonImage" width="24" height="24" class="mr-3"/>
                        <span v-else class="fr-social-icon mr-3 text-center" :style="`background: ${provider.uiConfig.iconBackground}; color:${provider.uiConfig.iconFontColor};`">
                            <i v-if="provider.uiConfig.iconClass === 'fa-cloud'" :class="['fa', provider.uiConfig.iconClass]"></i>
                            <i v-else :class="['fab', provider.uiConfig.iconClass]"></i>
                        </span>

                        <span>{{provider.uiConfig.buttonDisplayName}}</span>
                    </div>
                    <div class="float-right d-flex">
                        <a class="align-self-center flex-grow-2 text-right" href="#">
                            <span v-if="provider._refResourceId" @click.stop.prevent="showModal(provider.provider)">{{$t('pages.profile.socialSignIn.disconnect')}}</span>
                            <span v-else @click.stop.prevent="connectProvider(provider.provider)">{{$t('pages.profile.socialSignIn.connect')}}</span>
                        </a>
                        <div class="caret d-flex ml-3" v-if="provider._id">
                            <i class="fa fa-angle-down fa-lg pr-0 caret-down align-self-center"></i>
                            <i class="fa fa-angle-up fa-lg pr-0 pt-1 caret-up align-self-center"></i>
                        </div>
                    </div>
                </div>

                <div slot="list-item-collapse-body" v-if="provider._id">
                    <fr-social-identity-panel :provider="provider"></fr-social-identity-panel>
                </div>
            </fr-list-item>

        </fr-list-group>

        <b-modal id="showModal" ref="disconnectModal" cancel-variant="outline-secondary">
            <div slot="modal-header" class="d-flex w-100 h-100">
                <h5 class="modal-title align-self-center text-center">{{$t('pages.profile.socialSignIn.disconnect')}} {{disconnectedProvider}}</h5>
                <button type="button" aria-label="Close" class="close" @click="hideModal"><i class="fa fa-times"></i></button>
            </div>

            <b-container>
                {{$t('pages.profile.socialSignIn.disconnectConfirmMsg', {provider: disconnectedProvider})}}
            </b-container>

            <div slot="modal-footer" class="w-100">
                <div class="float-right">
                    <b-btn variant="outline-secondary mr-2" @click="hideModal">{{$t('common.form.close')}}</b-btn>
                    <b-btn type="button" variant="danger" @click="disconnectProvider">{{$t('pages.profile.socialSignIn.disconnect')}}</b-btn>
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
import _ from 'lodash';
import ListGroup from '@/components/utils/ListGroup';
import ListItem from '@/components/utils/ListItem';
import SocialIdentityPanel from './SocialIdentityPanel';

/**
 * @description Handles displaying a users social providers, will also allow a user to configure a new social provider based on available providers
 *
 * @fires POST resource/name/ID?_action=bind&provider=provider (e.g. managed/user/fakeID?_action=bind&provider=google) - Binds a provider based on a return client token from the provider
 * @fires GET /identityProviders - List of available social providers
 * @fires POST managed/user/ID?_fields=idps/* (e.g. managed/user/fakeId?_fields=idps/*) - List of social providers already configured for the current logged in resource.
 * @fires POST /identityProviders?_action=getAuthRedirect - Generated the redirect information for a selected social provider
 * @fires POST resource/name/ID?_action=unbind&provider=provider (e.g. managed/user/fakeID?_action=unbind&provider=google) - Unbinds a social provider from the current sessions user
 *
 */
export default {
    name: 'Social-Identities',
    components: {
        'fr-list-group': ListGroup,
        'fr-list-item': ListItem,
        'fr-social-identity-panel': SocialIdentityPanel
    },
    props: {
        'clientToken': String,
        'linkedProvider': String
    },
    data () {
        return {
            'allAvailableProviders': [],
            'connectedProviders': [],
            'providers': [],
            'toDisconnect': {}
        };
    },
    created () {
        if (!_.isUndefined(this.clientToken)) {
            const socialInstance = this.getRequestService();
            /* istanbul ignore next */
            socialInstance.post(`${this.$root.userStore.state.managedResource}/${this.$root.userStore.state.userId}?_action=bind&provider=${this.linkedProvider}`, JSON.stringify(this.clientToken))
                .then(() => {
                    this.getAllConnectedProviders(this.getRequestService({
                        headers: this.getAnonymousHeaders()
                    }));
                    this.displayNotification('success', `${_.find(this.providers, { provider: this.linkedProvider }).uiConfig.buttonDisplayName} has been linked`);
                    delete this.clientToken;
                })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification('error', error.response.data.message);
                });
        }
    },
    mounted () {
        /* istanbul ignore next */
        this.loadData();
    },
    computed: {
        disconnectedProvider () {
            let providerName = _.get(this.toDisconnect, 'uiConfig.buttonDisplayName');
            return providerName || '';
        }
    },
    methods: {
        loadData () {
            this.providers = [];
            /* istanbul ignore next */
            const socialInstance = this.getRequestService({
                headers: this.getAnonymousHeaders()
            });

            /* istanbul ignore next */
            socialInstance.get('/identityProviders')
                .then((response) => {
                    this.allAvailableProviders = response.data.providers;
                    this.getAllConnectedProviders(socialInstance);
                })
                .catch((error) => {
                    this.displayNotification('error', error.response.data.message);
                });
        },
        getAllConnectedProviders (socialInstance) {
            /* istanbul ignore next */
            socialInstance.get(`${this.$root.userStore.state.managedResource}/${this.$root.userStore.state.userId}?_fields=idps/*`)
                .then((response) => {
                    this.connectedProviders = response.data.idps;
                    this.providers = this.setProviders();
                })
                .catch((error) => {
                    this.displayNotification('error', error.response.data.message);
                });
        },
        setProviders () {
            let providers = [];
            _.each(this.allAvailableProviders, (provider) => {
                let matchFound = false;

                _.each(this.connectedProviders, (idp) => {
                    if (_.includes(idp._refResourceCollection, provider.provider)) {
                        matchFound = true;
                        providers.push(_.extend(idp, provider));
                    }
                });

                if (!matchFound) {
                    providers.push(provider);
                }
            });

            return providers;
        },
        showModal (provider) {
            this.toDisconnect = _.find(this.providers, { 'provider': provider });
            this.$refs.disconnectModal.show();
        },
        hideModal () {
            this.toDisconnect = {};
            this.$refs.disconnectModal.hide();
        },
        connectProvider (provider) {
            const socialInstance = this.getRequestService({
                headers: this.getAnonymousHeaders()
            });

            /* istanbul ignore next */
            socialInstance.post('/identityProviders?_action=getAuthRedirect', {
                'provider': provider,
                'landingPage': `${window.location.protocol}/#/${window.location.host}/login?_oauthReturn=true&provider=${provider}&gotoURL=profile`
            })
                .then((response) => {
                    localStorage.setItem('linkedProvider', provider);
                    localStorage.setItem('dataStoreToken', response.data.token);
                    window.location.href = response.data.redirect;
                })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification('error', error.response.data.message);
                });
        },
        disconnectProvider () {
            /* istanbul ignore next */
            const socialInstance = this.getRequestService({
                headers: this.getAnonymousHeaders()
            });

            /* istanbul ignore next */
            socialInstance.post(`${this.$root.userStore.state.managedResource}/${this.$root.userStore.state.userId}?_action=unbind&provider=${this.toDisconnect.provider}`)
                .then(() => {
                    this.connectedProviders.splice(_.findIndex(this.connectedProviders, { 'provider': this.toDisconnect.provider }), 1);
                    this.providers = this.setProviders();
                    this.displayNotification('success', `${_.find(this.providers, { provider: this.toDisconnect.provider }).uiConfig.buttonDisplayName} has been unlinked`);
                    this.hideModal();
                })
                .catch((error) => {
                    this.displayNotification('error', this.$t(error.response.data.message));
                    this.hideModal();
                });
        }
    }
};
</script>

<style lang="scss" scoped>
    .fr-social-details-title {
        font-weight: 500;
    }
    .fr-social-icon {
        display: inline-block;
        height: 24px;
        width: 24px;
        border-radius: 3px;
        font-size: 14px;
        padding: 2px;
    }
</style>
