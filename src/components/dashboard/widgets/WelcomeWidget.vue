<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
    <b-jumbotron class="text-center">
        <template slot="header">
            <b-img :src="require('@/assets/images/profile-default.png')" rounded="circle" width="112" height="112" alt="img" class="m-1 mb-3" />
            <div>{{$t('pages.dashboard.widgets.welcome.greeting')}}, <span class="text-capitalize">{{fullName}}</span></div>
        </template>
        <template slot="lead">
            <div>
                {{$t('pages.dashboard.widgets.welcome.welcomeMessage')}}
            </div>
            <b-button @click="openProfile()" variant="primary" class="mt-2">
                {{$t('pages.dashboard.widgets.welcome.editProfile')}}
            </b-button>
        </template>
    </b-jumbotron>
</template>

<script>
/**
 * @description Widget that provides a welcome message for the managed resource, also provides a button to directly access editing the resources profile.
 *
 **/
export default {
    name: 'Welcome-Widget',
    props: ['userDetails', 'widgetDetails'],
    data () {
        return {};
    },
    mounted () {},
    methods: {
        openProfile () {
            this.$router.push({ name: 'Profile', params: { openProfile: !this.$root.userStore.state.internalUser } });
        }
    },
    computed: {
        fullName () {
            let fullName = '';

            if (this.userDetails.givenName.length > 0 || this.userDetails.sn.length > 0) {
                fullName = this.userDetails.givenName + ' ' + this.userDetails.sn;
            } else {
                fullName = this.userDetails.userId;
            }

            return fullName;
        }
    }
};
</script>

<style lang="scss" scoped></style>
