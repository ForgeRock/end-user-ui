<template>
    <b-container>
        <b-row class="my-5" >
            <b-col class="profileCol mb-4" lg="4">
                <b-card class="text-center mb-4">
                    <b-img src="static/image/profile-default.png" rounded="circle" width="112" height="112" alt="img" class="m-1" />
                    <h4>{{usersName}}</h4>
                    <span class="text-muted">{{email}}</span>
                    <b-button variant="primary" block class="mt-4" v-b-modal.userDetailsModal>
                        {{$t('pages.profile.editPersonalInfo')}}
                    </b-button>
                </b-card>

                <fr-edit-personal-info></fr-edit-personal-info>

            </b-col>
            <b-col class="detailsCol" lg="8">
                <b-tabs>
                    <b-tab :title="$t('pages.profile.settings')" active></b-tab>
                    <b-tab :title="$t('pages.profile.activity')"></b-tab>
                </b-tabs>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
    import _ from 'lodash';
    import ListGroup from '@/components/utils/ListGroup';
    import ListItem from '@/components/utils/ListItem';
    import EditPersonalInfo from '@/components/selfservice/profile/EditPersonalInfo';

    export default {
        name: 'Profile',
        data: function () {
            return {
                usersName: '',
                email: ''
            };
        },
        components: {
            'fr-list-group': ListGroup,
            'fr-list-item': ListItem,
            'fr-edit-personal-info': EditPersonalInfo
        },
        mounted () {
            this.loadData();
        },
        methods: {
            loadData () {
                /* istanbul ignore next */
                let userId = this.$root.userStore.getUserState().userId,
                    selfServiceInstance = this.getRequestService();

                /* istanbul ignore next */
                selfServiceInstance.get(`managed/user/${userId}`)
                    .then((userDetails) => {
                        this.usersName = _.startCase(userDetails.data.givenName + ' ' + userDetails.data.sn);
                        this.email = userDetails.data.mail;
                    })
                    .catch((error) => {
                        /* istanbul ignore next */
                        this.$notify({
                            group: 'IDMMessages',
                            type: 'error',
                            title: 'Profile Error',
                            text: error.response.data.message
                        });
                    });
            }
        }
    };
</script>