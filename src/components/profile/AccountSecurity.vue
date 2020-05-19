<template>
    <fr-list-group :title="$t('pages.profile.accountSecurity.title')" :subtitle="$t('pages.profile.accountSecurity.subtitle')">
        <fr-edit-password v-if="$root.applicationStore.state.platformMode === false" @updateProfile="sendUpdateProfile" />
        <fr-edit-kba v-if="isOnKBA && $root.userStore.state.internalUser === false" :kba-data="kbaData" @updateKBA="sendUpdateKBA" />
    </fr-list-group>
</template>

<script>
import EditKBA from "./EditKBA";
import EditPassword from "./EditPassword";
import ListGroup from "../utils/ListGroup";

/**
 * @description Handles displaying account security controls (KBA change and password change)
 *
 */
export default {
    "name": "Account-Security",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-edit-kba": EditKBA,
        "fr-edit-password": EditPassword,
        "fr-list-group": ListGroup
    },
    data () {
        return {
            "isOnKBA": false,
            "kbaData": {}
        };
    },
    "methods": {
        sendUpdateKBA (payload, config) {
            this.$emit("updateKBA", payload, config);
        },
        sendUpdateProfile (payload, config) {
            this.$emit("updateProfile", payload, config);
        }
    },
    mounted () {
        /* istanbul ignore next */
        const selfServiceInstance = this.getRequestService({
            "headers": this.getAnonymousHeaders()
        });

        // eslint-disable-next-line no-warning-comments
        // TODO: replace this with call to 'Liveness Service'
        /* istanbul ignore next */
        selfServiceInstance.get("selfservice/kba").then((response) => {
            this.isOnKBA = true;
            this.kbaData = response.data;
        }).
            /* istanbul ignore next */
            catch(() => {
                this.isOnKBA = false;
            });
    }
};
</script>
