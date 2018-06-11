<template>
    <b-container fluid>
        <template v-if="requestsLoaded">
            <b-tabs class='mt-4' v-if="false"> <!--resources && resources.length > 0"> -->
                <b-tab title='Resources' active>
                    <fr-resources
                        @renderShareModal="renderShareModal"
                        @renderUnshareModal="renderUnshareModal"
                        :resources="resources"></fr-resources>
                </b-tab>
                <b-tab title='Activity' v-if="activity && activity.length > 0">
                    <fr-activity :umaHistory="activity"></fr-activity>
                </b-tab>
                <b-tab title='Requests'>
                    <template slot="title">
                        {{$t('pages.uma.notifications.requests')}} <b-badge pill variant="danger">{{numberOfRequests}}</b-badge>
                    </template>
                    <fr-requests></fr-requests>
                </b-tab>
            </b-tabs>
            <div v-else>
                <fr-center-card :showLogo="false" class="mt-5">
                    <b-card-body slot="center-card-body">
                        <img src="static/images/empty-box.svg" class="mb-4" :alt="$t('common.form.logo')" style="width:150px;"/>
                        <h5 class="h5">{{$t(`pages.uma.resources.noDataState`)}}</h5>
                    </b-card-body>
                </fr-center-card>
            </div>
            <fr-share v-if="resource" :resource="resource"
                @shareResource="shareResource"
                @renderUnshareModal="renderUnshareModal"
                @modifyResource="modifyResource"></fr-share>
            <fr-unshare :resourceId="resourceId" :resourceName="resourceName" @unshareResource="unshareResource"></fr-unshare>
        </template>
    </b-container>
</template>

<script>
    import Activity from '@/components/uma/Activity';
    import CenterCard from '@/components/utils/CenterCard';
    import Requests from '@/components/uma/Requests';
    import Resources from '@/components/uma/Resources';
    import Share from '@/components/uma/Share';
    import Unshare from '@/components/uma/Unshare';

    export default {
        name: 'Sharing',
        components: {
            'fr-activity': Activity,
            'fr-center-card': CenterCard,
            'fr-requests': Requests,
            'fr-resources': Resources,
            'fr-share': Share,
            'fr-unshare': Unshare
        },
        data () {
            return {
                requestsLoaded: false,
                resource: null,
                resourceId: '',
                resourceName: '',
                resources: [],
                activity: [],
                requests: [],
                resourcesCount: 0,
                activityCount: 0,
                numberOfRequests: ''
            };
        },
        computed: {
            amDataEndpoints () {
                return this.$root.applicationStore.state.amDataEndpoints;
            }
        },
        mounted () {
            this.getResources();
            this.getActivity();
        },
        methods: {
            getResources () {
                /* istanbul ignore next */
                let userName = this.$root.userStore.state.userName,
                    query = '?_queryId=*',
                    selfServiceInstance = this.getRequestService(),
                    url = this.amDataEndpoints.baseUrl + userName + this.amDataEndpoints.resourceSet + query;

                /* istanbul ignore next */
                // by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
                selfServiceInstance.get(url, { withCredentials: true }).then((response) => {
                    this.resources = response.data.result;
                    this.requestsLoaded = true;
                })
                .catch((error) => {
                    /* istanbul ignore next */
                    let errorMsg = error.response.data.message;
                    this.displayNotification('error', errorMsg);
                });
            },
            getActivity () {
                /* istanbul ignore next */
                let userName = this.$root.userStore.state.userName,
                    query = '?_sortKeys=-eventTime&_queryFilter=true',
                    selfServiceInstance = this.getRequestService(),
                    url = this.amDataEndpoints.baseUrl + userName + this.amDataEndpoints.auditHistory + query;

                /* istanbul ignore next */
                // by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
                selfServiceInstance.get(url, { withCredentials: true }).then((response) => {
                    this.activity = response.data.result;
                })
                .catch((error) => {
                    /* istanbul ignore next */
                    let errorMsg = error.response.data.message;
                    this.displayNotification('error', errorMsg);
                });
            },
            getRequests () {
                /* istanbul ignore next */
                let userName = this.$root.userStore.state.userName,
                    query = '?_sortKeys=user&_queryFilter=true',
                    selfServiceInstance = this.getRequestService(),
                    url = this.amDataEndpoints.baseUrl + userName + '/uma/pendingrequests' + query;

                /* istanbul ignore next */
                // by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
                selfServiceInstance.get(url, { withCredentials: true }).then((response) => {
                    this.requests = response.data.result;
                })
                .catch((error) => {
                    /* istanbul ignore next */
                    let errorMsg = error.response.data.message;
                    this.displayNotification('error', errorMsg);
                });
            },
            renderShareModal (resource) {
                this.resource = resource;
                this.$nextTick(() => {
                    this.$root.$emit('bv::show::modal', 'shareModal');
                });
            },
            renderUnshareModal (resourceName, resourceId) {
                this.resourceName = resourceName;
                this.resourceId = resourceId;
                this.$nextTick(() => {
                    this.$root.$emit('bv::show::modal', 'unshareModal');
                });
            },
            shareResource (payload, config = {}) {
                /* istanbul ignore next */
                let userName = this.$root.userStore.state.userName,
                    successMsg = this.$t('common.user.sharing.shareSuccess'),
                    selfServiceInstance = this.getRequestService(),
                    url = this.amDataEndpoints.baseUrl + userName + '/uma/policies/' + payload.policyId;

                /* istanbul ignore next */
                selfServiceInstance.put(url, payload, { withCredentials: true }).then((response) => {
                    if (config.onSuccess) {
                        config.onSuccess();
                    }
                    this.displayNotification('success', successMsg);
                    this.getResources();
                })
                .catch((error) => {
                    if (error.response.status === 409) {
                        this.displayNotification('success', successMsg);
                    } else {
                        /* istanbul ignore next */
                        this.displayNotification('error', error.response.data.message);
                    }
                });
            },
            unshareResource (resourceId) {
                /* istanbul ignore next */
                let userName = this.$root.userStore.state.userName,
                    successMsg = this.$t('common.user.sharing.unshareSuccess'),
                    selfServiceInstance = this.getRequestService(),
                    url = this.amDataEndpoints.baseUrl + userName + '/uma/policies/' + resourceId;

                /* istanbul ignore next */
                selfServiceInstance.delete(url, { withCredentials: true }).then((response) => {
                    this.displayNotification('success', successMsg);
                    this.getResources();
                })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification('error', error.response.data.message);
                });
            },
            modifyResource (resourceId, payload, config = {}) {
                let successMsg = config.unshare ? this.$t('common.user.sharing.unshareSuccess') : this.$t('common.user.sharing.shareSuccess'),
                    userName = this.$root.userStore.state.userName,
                    url = this.amDataEndpoints.baseUrl + userName + '/uma/policies/' + resourceId,
                    selfServiceInstance = this.getRequestService();

                selfServiceInstance.delete(url, { withCredentials: true })
                .then((res) => {
                    return selfServiceInstance.put(url, payload, { withCredentials: true });
                })
                .then((res) => {
                    if (config.onSuccess) {
                        config.onSuccess();
                    }

                    this.displayNotification('success', successMsg);
                    this.getResources();
                })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification('error', error.response.data.message);
                });
            }
        }
    };
</script>

<style lang='scss' scoped>
</style>
