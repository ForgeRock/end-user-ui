<template>
    <b-container>
        <b-row class="my-5" >
            <b-col class="profileCol mb-4" lg="4">
                <b-card class="text-center mb-4">
                    <b-img src="static/image/profile-default.png" rounded="circle" width="112" height="112" alt="img" class="m-1 mb-3" />
                    <h4>{{fullName}}</h4>
                    <span class="text-muted">{{email}}</span>
                    <b-button ref="editProfileButton" variant="primary" block class="mt-4" v-b-modal.userDetailsModal>
                        {{$t('pages.profile.editPersonalInfo')}}
                    </b-button>
                </b-card>

                <fr-edit-personal-info></fr-edit-personal-info>
            </b-col>
            <b-col class="detailsCol" lg="8">
                <b-tabs>
                    <b-tab :title="$t('pages.profile.settings')" active>
                        <fr-account-security></fr-account-security>
                        <fr-preferences></fr-preferences>
                        <fr-consent :consentedMappings="profile.consentedMappings"></fr-consent>
                        <fr-account-controls></fr-account-controls>
                    </b-tab>
                    <b-tab :title="$t('pages.profile.activity')"></b-tab>
                </b-tabs>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
    import _ from 'lodash';
    import AccountControls from '@/components/profile/AccountControls';
    import AccountSecurity from '@/components/selfservice/profile/AccountSecurity';
    import EditPersonalInfo from '@/components/profile/EditPersonalInfo';
    import Preferences from '@/components/profile/Preferences';
    import Consent from '@/components/profile/Consent';

    export default {
        name: 'Profile',
        props: {
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
            'fr-consent': Consent
        },
        mounted () {
            if (this.openProfile) {
                this.$refs.editProfileButton.click();
            }
        },
        computed: {
            fullName () {
                return _.startCase(this.$root.userStore.state.givenName + ' ' + this.$root.userStore.state.sn);
            },
            email () {
                return this.$root.userStore.state.email;
            },
            profile () {
                return this.$root.userStore.state.profile;
            }
        }
    };
</script>
