<template>
    <b-container>
        <b-row class="my-5" >
            <b-col class="profileCol mb-4" lg="4">
                <b-card class="text-center mb-4">
                    <b-img src="static/image/profile-default.png" rounded="circle" width="112" height="112" alt="img" class="m-1" />
                    <h4>{{usersName}}</h4>
                    <span class="text-muted">{{email}}</span>
                    <b-button variant="primary" block class="mt-4" href="/dashboard">
                        {{$t('pages.profile.editPersonalInfo')}}
                    </b-button>
                </b-card>
            </b-col>
            <b-col class="detailsCol" lg="8">
                <b-tabs>
                    <b-tab :title="$t('pages.profile.settings')" active>
                        <fr-list-group title="EXAMPLE LIST GROUP" subtitle="Example subtitle, remove when real.">
                            <fr-list-item
                                :collapsible="true"
                                :panelShown="false">
                                <div slot="list-item-header">
                                    <h6 class="my-0">Test</h6>
                                    <div class="meta"><small class="text-muted">Test sub-title</small></div>
                                </div>

                                <div slot="list-item-collapse-body">
                                    Test Content
                                    Test Content
                                    Test Content
                                </div>
                            </fr-list-item>

                            <!--<fr-list-item-->
                                    <!--:collapsible="false"-->
                                    <!--:panelShown="true">-->
                                <!--<div slot="list-item-header">-->
                                    <!--Not Collapsible with Panel-->
                                    <!--<span class="subtext">2 minutes ago</span>-->
                                <!--</div>-->

                                <!--<div slot="list-item-collapse-body">-->
                                    <!--test test-->
                                <!--</div>-->
                            <!--</fr-list-item>-->

                            <!--<fr-list-item-->
                                    <!--:collapsible="true"-->
                                    <!--:panelShown="false">-->
                                <!--<div slot="list-item-header">-->
                                    <!--Collapsible with Panel hidden by default-->
                                    <!--<span class="subtext">2 minutes ago</span>-->
                                <!--</div>-->

                                <!--<div slot="list-item-collapse-body">-->
                                    <!--test test-->
                                <!--</div>-->
                            <!--</fr-list-item>-->

                            <!--<fr-list-item-->
                                    <!--:collapsible="false"-->
                                    <!--:panelShown="false">-->
                                <!--<div slot="list-item-header">-->
                                    <!--Not Collapsible with No-->
                                    <!--<span class="subtext">2 minutes ago</span>-->
                                <!--</div>-->

                                <!--<div slot="list-item-collapse-body">-->
                                    <!--test test-->
                                <!--</div>-->
                            <!--</fr-list-item>-->

                        </fr-list-group>
                    </b-tab>
                    <b-tab :title="$t('pages.profile.activity')">
                    </b-tab>
                </b-tabs>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
    import _ from 'lodash';
    import ListGroup from '@/components/utils/ListGroup';
    import ListItem from '@/components/utils/ListItem';

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
            'fr-list-item': ListItem
        },
        mounted: function () {
            this.loadData();
        },
        methods: {
            loadData: function () {
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