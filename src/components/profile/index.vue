<template>
    <b-container>
        <b-row class="my-5" >
            <b-col class="profileCol mb-4" lg="4">
                <b-card class="text-center mb-4">
                    <b-img src="static/images/profile-default.png" rounded="circle" width="112" height="112" alt="img" class="m-1 mb-3" />
                    <h4>{{fullName}}</h4>
                    <span class="text-muted">{{email}}</span>
                    <b-button v-if="$root.userStore.state.internalUser === false" ref="editProfileButton" variant="primary" block class="mt-4" v-b-modal.userDetailsModal>
                        {{$t('pages.profile.editPersonalInfo')}}
                    </b-button>
                </b-card>

                <fr-edit-personal-info @updateProfile="updateProfile" :schema="schema" :profile="profile"></fr-edit-personal-info>
            </b-col>
            <b-col class="detailsCol" lg="8">
                <b-tabs>
                    <b-tab :title="$t('pages.profile.settings')" active>
                        <fr-account-security @updateProfile="updateProfile" @updateKBA="updateKBA"></fr-account-security>
                        <fr-social-identities v-if="$root.userStore.state.internalUser === false" :clientToken="clientToken" :linkedProvider="linkedProvider"></fr-social-identities>
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
    import AccountControls from '@/components/profile/AccountControls';
    import AccountSecurity from '@/components/profile/AccountSecurity';
    import EditPersonalInfo from '@/components/profile/EditPersonalInfo';
    import Preferences from '@/components/profile/Preferences';
    import TrustedDevices from '@/components/profile/TrustedDevices';
    import AuthorizedApplications from '@/components/profile/AuthorizedApplications';
    import Consent from '@/components/profile/Consent';
    import SocialIdentities from '@/components/profile/SocialIdentities';

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
            'fr-account-controls': AccountControls,
            'fr-account-security': AccountSecurity,
            'fr-edit-personal-info': EditPersonalInfo,
            'fr-preferences': Preferences,
            'fr-trusted-devices': TrustedDevices,
            'fr-authorized-applications': AuthorizedApplications,
            'fr-consent': Consent,
            'fr-social-identities': SocialIdentities
        },
        mounted () {
            if (this.openProfile) {
                this.$refs.editProfileButton.click();
            }
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