<template>
    <b-container>
        <b-row class="my-5" >
            <b-col class="profileCol mb-4" lg="4">
                <b-card class="text-center mb-4">
                    <b-img :src="require('@/assets/images/profile-default.png')" rounded="circle" width="112" height="112" alt="img" class="m-1 mb-3" />
                    <h4 class="text-truncate">{{fullName}}</h4>
                    <div class="text-muted text-truncate">{{email}}</div>
                    <b-button v-if="$root.userStore.state.internalUser === false" ref="editProfileButton" variant="primary" block class="mt-4" v-b-modal.userDetailsModal>
                        {{$t('pages.profile.editPersonalInfo')}}
                    </b-button>
                </b-card>

                <fr-edit-personal-info :autoOpen="openProfile" @updateProfile="updateProfile" :schema="schema" :profile="profile"></fr-edit-personal-info>
            </b-col>
            <b-col lg="8">
                <b-tabs content-class="mt-4">
                    <b-tab :title="$t('pages.profile.settings')" active>
                        <fr-account-security @updateProfile="updateProfile" @updateKBA="updateKBA"></fr-account-security>
                        <!--
                            UI check for platform, if platform need to load a different social based component
                        -->
                        <fr-social-identities v-if="$root.userStore.state.internalUser === false && $root.applicationStore.state.platformMode === false" :clientToken="clientToken" :linkedProvider="linkedProvider"></fr-social-identities>
                        <fr-authorized-applications v-if="$root.applicationStore.state.amDataEndpoints && $root.userStore.state.internalUser === false"></fr-authorized-applications>
                        <fr-trusted-devices v-if="$root.applicationStore.state.amDataEndpoints && $root.userStore.state.internalUser === false"></fr-trusted-devices>
                        <fr-preferences v-if="$root.userStore.state.internalUser === false" @updateProfile="updateProfile"></fr-preferences>
                        <fr-consent v-if="$root.userStore.state.internalUser === false" :consentedMappings="profile.consentedMappings" @updateProfile="updateProfile"></fr-consent>
                        <fr-account-controls></fr-account-controls>
                    </b-tab>
                </b-tabs>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
import _ from 'lodash';
/**
 * @description Controlling component for profile management (changing password, KBA, edit profile, social management etc.)
 *
 * @fires PATCH type/name/id (e.g. managed/user/_id) - Submits a patch object of changes for the provided resource record
 */
export default {
    name: 'Profile',
    props: {
        'clientToken': String,
        'linkedProvider': String,
        'openProfile': {
            required: false,
            default: false
        }
    },
    components: {
        'fr-account-controls': () => import('@/components/profile/AccountControls'),
        'fr-account-security': () => import('@/components/profile/AccountSecurity'),
        'fr-edit-personal-info': () => import('@/components/profile/EditPersonalInfo'),
        'fr-preferences': () => import('@/components/profile/Preferences'),
        'fr-trusted-devices': () => import('@/components/profile/TrustedDevices'),
        'fr-authorized-applications': () => import('@/components/profile/AuthorizedApplications'),
        'fr-consent': () => import('@/components/profile/Consent'),
        'fr-social-identities': () => import('@/components/profile/SocialIdentities')
    },
    computed: {
        fullName () {
            let fullName = '';

            if (this.$root.userStore.state.givenName.length > 0 || this.$root.userStore.state.sn.length > 0) {
                fullName = _.startCase(this.$root.userStore.state.givenName + ' ' + this.$root.userStore.state.sn);
            } else {
                fullName = this.$root.userStore.state.userId;
            }

            return fullName;
        },
        email () {
            return this.$root.userStore.state.email;
        },
        profile () {
            return this.$root.userStore.state.profile;
        },
        schema () {
            return this.$root.userStore.state.schema;
        }
    },
    methods: {
        updateProfile (payload, config = {}) {
            this.makeUpdateRequest(this.$root.userStore.state.managedResource, payload, config);
        },
        updateKBA (payload, config) {
            this.makeUpdateRequest('selfservice/user', payload, config);
        },
        makeUpdateRequest (endpoint, payload, config = {}) {
            /* istanbul ignore next */
            let successMsg = config.successMsg || this.$t('common.user.profile.updateSuccess'),
                userId = this.$root.userStore.state.userId,
                selfServiceInstance = this.getRequestService({
                    headers: config.headers
                });

            /* istanbul ignore next */
            selfServiceInstance.patch(`${endpoint}/${userId}`, payload).then((response) => {
                this.$root.userStore.setProfileAction(response.data);
                this.displayNotification('success', successMsg);

                if (config.onSuccess) {
                    config.onSuccess();
                }
            })
                .catch((error) => {
                    /* istanbul ignore next */
                    let errorMsg = config.errorMsg || error.response.data.message;
                    this.displayNotification('error', errorMsg);

                    if (config.onError) {
                        config.onError(error);
                    }
                });
        }
    }
};
</script>
<style type="scss" scoped>
    /deep/ .nav-tabs {
        border-bottom: 1px solid rgba(0, 0, 0, 0.125);
    }
</style>
