<template>
    <b-container>
        <b-row class="my-5">
            <b-col class="profileCol mb-4" lg="4">
                <b-card class="text-center mb-4">
                    <b-img :src="require('@/assets/images/profile-default.png')" rounded="circle" width="112" height="112" alt="img" class="m-1 mb-3" />
                    <h4 class="text-truncate">{{ fullName }}</h4>
                    <div class="text-muted text-truncate">{{ email }}</div>
                    <b-button v-if="$root.userStore.state.internalUser === false" ref="editProfileButton" v-b-modal.userDetailsModal variant="primary" block class="mt-4">
                        {{ $t('pages.profile.editPersonalInfo') }}
                    </b-button>
                </b-card>

                <fr-edit-personal-info :auto-open="openProfile" :schema="schema" :profile="profile" @updateProfile="updateProfile" />
            </b-col>
            <b-col lg="8">
                <b-tabs content-class="mt-4">
                    <b-tab :title="$t('pages.profile.settings')" active>
                        <fr-account-security @updateProfile="updateProfile" @updateKBA="updateKBA" />
                        <!--
                            UI check for platform, if platform need to load a different social based component
                        -->
                        <fr-social-identities v-if="$root.userStore.state.internalUser === false && $root.applicationStore.state.platformMode === false" :client-token="clientToken" :linked-provider="linkedProvider" />
                        <fr-authorized-applications v-if="$root.applicationStore.state.amDataEndpoints && $root.userStore.state.internalUser === false" />
                        <fr-trusted-devices v-if="$root.applicationStore.state.amDataEndpoints && $root.userStore.state.internalUser === false" />
                        <fr-preferences v-if="$root.userStore.state.internalUser === false" @updateProfile="updateProfile" />
                        <fr-consent v-if="$root.userStore.state.internalUser === false" :consented-mappings="profile.consentedMappings" @updateProfile="updateProfile" />
                        <fr-account-controls />
                    </b-tab>
                </b-tabs>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>

import { startCase } from "lodash";

/**
 * @description Controlling component for profile management (changing password, KBA, edit profile, social management etc.)
 *
 * @fires PATCH type/name/id (e.g. managed/user/_id) - Submits a patch object of changes for the provided resource record
 */
export default {
    "name": "Profile",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-account-controls": () => import("@/components/profile/AccountControls"),
        "fr-account-security": () => import("@/components/profile/AccountSecurity"),
        "fr-authorized-applications": () => import("@/components/profile/AuthorizedApplications"),
        "fr-consent": () => import("@/components/profile/Consent"),
        "fr-edit-personal-info": () => import("@/components/profile/EditPersonalInfo"),
        "fr-preferences": () => import("@/components/profile/Preferences"),
        "fr-social-identities": () => import("@/components/profile/SocialIdentities"),
        "fr-trusted-devices": () => import("@/components/profile/TrustedDevices")
    },
    "computed": {
        email () {
            return this.$root.userStore.state.email;
        },
        fullName () {
            let fullName = "";

            if (this.$root.userStore.state.givenName.length > 0 || this.$root.userStore.state.sn.length > 0) {
                fullName = startCase(`${this.$root.userStore.state.givenName} ${this.$root.userStore.state.sn}`);
            } else {
                fullName = this.$root.userStore.state.userId;
            }

            return fullName;
        },
        profile () {
            return this.$root.userStore.state.profile;
        },
        schema () {
            return this.$root.userStore.state.schema;
        }
    },
    "methods": {
        makeUpdateRequest (endpoint, payload, config = {}) {
            /* istanbul ignore next */
            const selfServiceInstance = this.getRequestService({
                    "headers": config.headers
                }),
                successMessage = config.successMsg || this.$t("common.user.profile.updateSuccess"),
                { userId } = this.$root.userStore.state;

            /* istanbul ignore next */
            selfServiceInstance.patch(`${endpoint}/${userId}`, payload).then((response) => {
                this.$root.userStore.setProfileAction(response.data);
                this.displayNotification("success", successMessage);

                if (config.onSuccess) {
                    config.onSuccess();
                }
            }).
                catch((error) => {
                    /* istanbul ignore next */
                    const errorMessage = config.errorMsg || error.response.data.message;
                    this.displayNotification("error", errorMessage);

                    if (config.onError) {
                        config.onError(error);
                    }
                });
        },
        updateKBA (payload, config) {
            this.makeUpdateRequest("selfservice/user", payload, config);
        },
        updateProfile (payload, config = {}) {
            this.makeUpdateRequest(this.$root.userStore.state.managedResource, payload, config);
        }
    },
    "props": {
        "clientToken": String,
        "linkedProvider": String,
        "openProfile": {
            "default": false,
            "required": false
        }
    }
};
</script>
<style lang="scss" scoped>
    /deep/ .nav-tabs {
        border-bottom: 1px solid rgba(0, 0, 0, 0.125);
    }
</style>
