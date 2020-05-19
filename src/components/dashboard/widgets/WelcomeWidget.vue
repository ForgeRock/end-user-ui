<template>
    <b-jumbotron class="text-center">
        <template slot="header">
            <b-img :src="require('@/assets/images/profile-default.png')" rounded="circle" width="112" height="112" alt="img" class="m-1 mb-3" />
            <div>{{ $t('pages.dashboard.widgets.welcome.greeting') }}, {{ fullName }}</div>
        </template>
        <template slot="lead">
            <div>
                {{ $t('pages.dashboard.widgets.welcome.welcomeMessage') }}
            </div>
            <b-button variant="primary" class="mt-2" @click="openProfile()">
                {{ $t('pages.dashboard.widgets.welcome.editProfile') }}
            </b-button>
        </template>
    </b-jumbotron>
</template>

<script>
import { startCase } from "lodash";

/**
 * @description Widget that provides a welcome message for the managed resource, also provides a button to directly access editing the resources profile.
 */
export default {
    "name": "Welcome-Widget",
    // eslint-disable-next-line sort-keys
    "computed": {
        fullName () {
            let fullName = "";

            if (this.userDetails.givenName.length > 0 || this.userDetails.sn.length > 0) {
                fullName = startCase(`${this.userDetails.givenName} ${this.userDetails.sn}`);
            } else {
                fullName = this.userDetails.userId;
            }

            return fullName;
        }
    },
    data () {
        return {};
    },
    "methods": {
        openProfile () {
            this.$router.push({ "name": "Profile", "params": { "openProfile": !this.$root.userStore.state.internalUser } });
        }
    },
    mounted () {
        // Do nothing
    },
    "props": ["userDetails", "widgetDetails"]
};
</script>

<style lang="scss" scoped></style>
