<template>
    <b-container fluid>
        <template v-if="requestsLoaded">
            <b-tabs class='mt-4' v-if="resources.length > 0" @click="testForReload">
                <b-tab title='Resources' active>
                    <fr-resources
                        @renderShareModal="renderShareModal"
                        @renderUnshareModal="renderUnshareModal"
                        :resources="resources"></fr-resources>
                </b-tab>
                <b-tab title='Activity' v-if="activity.length > 0" @click="testForReload">
                    <fr-activity :umaHistory="umaHistory"></fr-activity>
                </b-tab>
                <b-tab title='Requests' v-if="requests.length > 0">
                    <template slot="title">
                        {{$t('pages.uma.notifications.requests')}} <b-badge pill variant="danger">{{requests.length}}</b-badge>
                    </template>
                    <fr-requests :requests="requests" @finalizeResourceAccess="finalizeResourceAccess"></fr-requests>
                </b-tab>
            </b-tabs>
            <div v-else>
                <fr-center-card :showLogo="false" class="mt-5">
                    <b-card-body slot="center-card-body">
                        <img :src="require('@/assets/images/empty-box.svg')" class="mb-4" :alt="$t('common.form.logo')" style="width:150px;"/>
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
import _ from 'lodash';
import CenterCard from '@/components/utils/CenterCard';
import Activity from '@/components/uma/Activity';
import Requests from '@/components/uma/Requests';
import Resources from '@/components/uma/Resources';
import Share from '@/components/uma/Share';
import Unshare from '@/components/uma/Unshare';

/**
 * @description Controlling component for sharing resources, this UI is primarily focused making use of AM and its UMA features.
 * This UI feature requires full stack (IDM/AM) to be configured and for AM to be properly configured to make use of UMA
 **/
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
            delayedUpdate: false
        };
    },
    computed: {
        amDataEndpoints () {
            let tempAmEndpoints = {};

            if (!_.isNull(this.$root.applicationStore.state.amDataEndpoints)) {
                tempAmEndpoints = this.$root.applicationStore.state.amDataEndpoints;
            }

            return tempAmEndpoints;
        },
        umaHistory () {
            return _.map(this.activity, (res) => {
                let resource = _.find(this.resources, { _id: res.resourceSetId });

                if (_.has(resource, 'icon_uri')) {
                    res.icon_uri = resource.icon_uri;
                }

                return res;
            });
        }
    },
    beforeMount () {
        this.loadData();
    },
    methods: {
        loadData () {
            this.getResources();
            this.getActivity();
            this.getRequests();
        },
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
                    this.resources = [];
                    this.requestsLoaded = true;

                    if (error.response) {
                        this.displayNotification('error', error.response.data.message);
                    } else {
                        this.displayNotification('error', error.message);
                    }
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
                    this.activity = [];
                    /* istanbul ignore next */
                    if (error.response) {
                        this.displayNotification('error', error.response.data.message);
                    } else {
                        this.displayNotification('error', error.message);
                    }
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
                this.requests = _.map(response.data.result, (request) => {
                    let resource = _.find(this.resources, { name: request.resource });

                    if (_.has(resource, 'icon_uri')) {
                        request.icon_uri = resource.icon_uri;
                    }

                    if (_.has(resource, 'scopes')) {
                        request.scopes = resource.scopes;
                    }

                    request.allowed = false;
                    request.decision = false;

                    return request;
                });
            })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.requests = {};

                    if (error.response) {
                        this.displayNotification('error', error.response.data.message);
                    } else {
                        this.displayNotification('error', error.message);
                    }
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
                this.loadData();
            })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification('error', error.response.data.message);
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
                this.loadData();
            })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification('error', error.response.data.message);
                });
        },
        modifyResource (resourceId, payload, config = {}) {
            let successMsg = config.unshare ? this.$t('common.user.sharing.unshareSuccess') : this.$t('common.user.sharing.modifySuccess'),
                userName = this.$root.userStore.state.userName,
                url = this.amDataEndpoints.baseUrl + userName + '/uma/policies/' + resourceId,
                selfServiceInstance = this.getRequestService(),
                headers = { 'Accept-API-Version': 'protocol=1.0,resource=1.0' };

            selfServiceInstance.put(url, payload, { withCredentials: true, headers })
                .then((res) => {
                    if (config.onSuccess) {
                        config.onSuccess();
                    }

                    this.displayNotification('success', successMsg);
                    this.loadData();
                })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification('error', error.response.data.message);
                });
        },
        finalizeResourceAccess (id, action, config = {}) {
            /* istanbul ignore next */
            let userName = this.$root.userStore.state.userName,
                successMsg = action === 'approve' ? this.$t('common.user.sharing.requestAllowedSuccess') : this.$t('common.user.sharing.requestDeniedSuccess'),
                selfServiceInstance = this.getRequestService(),
                payload = { scopes: config.scopes || {} },
                url = `${this.amDataEndpoints.baseUrl}${userName}/uma/pendingrequests/${id}?_action=${action}`;

            /* istanbul ignore next */
            selfServiceInstance.post(url, payload, { withCredentials: true }).then((response) => {
                if (config.onSuccess) {
                    config.onSuccess();
                }

                this.delayedUpdate = true;
                this.displayNotification('success', successMsg);
            })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification('error', error.response.data.message);
                });
        },
        testForReload () {
            if (this.delayedUpdate === true) {
                this.delayedUpdate = false;

                this.loadData();
            }
        }
    }
};
</script>

<style lang='scss' scoped>
</style>
