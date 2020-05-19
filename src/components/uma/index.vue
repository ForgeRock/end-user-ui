<template>
    <b-container fluid>
        <template v-if="requestsLoaded">
            <b-tabs v-if="resources.length > 0" class="mt-4" @click="testForReload">
                <b-tab title="Resources" active>
                    <fr-resources
                        :resources="resources"
                        @renderShareModal="renderShareModal"
                        @renderUnshareModal="renderUnshareModal"
                    />
                </b-tab>
                <b-tab v-if="activity.length > 0" title="Activity" @click="testForReload">
                    <fr-activity :uma-history="umaHistory" />
                </b-tab>
                <b-tab v-if="requests.length > 0" title="Requests">
                    <template slot="title">
                        {{ $t('pages.uma.notifications.requests') }} <b-badge pill variant="danger">{{ requests.length }}</b-badge>
                    </template>
                    <fr-requests :requests="requests" @finalizeResourceAccess="finalizeResourceAccess" />
                </b-tab>
            </b-tabs>
            <div v-else>
                <fr-center-card :show-logo="false" class="mt-5">
                    <b-card-body slot="center-card-body">
                        <img :src="require('@/assets/images/empty-box.svg')" class="mb-4" :alt="$t('common.form.logo')" style="width:150px;">
                        <h5 class="h5">{{ $t(`pages.uma.resources.noDataState`) }}</h5>
                    </b-card-body>
                </fr-center-card>
            </div>
            <fr-share
                v-if="resource"
                :resource="resource"
                @shareResource="shareResource"
                @renderUnshareModal="renderUnshareModal"
                @modifyResource="modifyResource"
            />
            <fr-unshare :resource-id="resourceId" :resource-name="resourceName" @unshareResource="unshareResource" />
        </template>
    </b-container>
</template>

<script>
import { find, has, isNull, map } from "lodash";
import CenterCard from "../utils/CenterCard";
import Activity from "./Activity";
import Requests from "./Requests";
import Resources from "./Resources";
import Share from "./Share";
import Unshare from "./Unshare";

/**
 * @description Controlling component for sharing resources, this UI is primarily focused making use of AM and its UMA features.
 * This UI feature requires full stack (IDM/AM) to be configured and for AM to be properly configured to make use of UMA
 */
export default {
    "name": "Sharing",
    // eslint-disable-next-line sort-keys
    data () {
        return {
            "activity": [],
            "activityCount": 0,
            "delayedUpdate": false,
            "requests": [],
            "requestsLoaded": false,
            "resource": null,
            "resourceId": "",
            "resourceName": "",
            "resources": [],
            "resourcesCount": 0
        };
    },
    // eslint-disable-next-line sort-keys
    beforeMount () {
        this.loadData();
    },
    "components": {
        "fr-activity": Activity,
        "fr-center-card": CenterCard,
        "fr-requests": Requests,
        "fr-resources": Resources,
        "fr-share": Share,
        "fr-unshare": Unshare
    },
    "computed": {
        amDataEndpoints () {
            let temporaryAmEndpoints = {};

            if (!isNull(this.$root.applicationStore.state.amDataEndpoints)) {
                temporaryAmEndpoints = this.$root.applicationStore.state.amDataEndpoints;
            }

            return temporaryAmEndpoints;
        },
        umaHistory () {
            return map(this.activity, (resource_) => {
                const resource = find(this.resources, { "_id": resource_.resourceSetId });

                if (has(resource, "icon_uri")) {
                    // eslint-disable-next-line camelcase
                    resource_.icon_uri = resource.icon_uri;
                }

                return resource_;
            });
        }
    },
    "methods": {
        finalizeResourceAccess (id, action, config = {}) {
            /* istanbul ignore next */
            const { userName } = this.$root.userStore.state,
                payload = { "scopes": config.scopes || {} },
                selfServiceInstance = this.getRequestService(),
                successMessage = action === "approve" ? this.$t("common.user.sharing.requestAllowedSuccess") : this.$t("common.user.sharing.requestDeniedSuccess"),
                url = `${this.amDataEndpoints.baseUrl}${userName}/uma/pendingrequests/${id}?_action=${action}`;

            /* istanbul ignore next */
            selfServiceInstance.post(url, payload, { "withCredentials": true }).then((response) => {
                if (config.onSuccess) {
                    config.onSuccess();
                }

                this.delayedUpdate = true;
                this.displayNotification("success", successMessage);
            }).
                catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification("error", error.response.data.message);
                });
        },
        getActivity () {
            /* istanbul ignore next */
            const { userName } = this.$root.userStore.state,
                query = "?_sortKeys=-eventTime&_queryFilter=true",
                selfServiceInstance = this.getRequestService(),
                url = this.amDataEndpoints.baseUrl + userName + this.amDataEndpoints.auditHistory + query;

            /* istanbul ignore next */
            // By default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
            selfServiceInstance.get(url, { "withCredentials": true }).then((response) => {
                this.activity = response.data.result;
            }).
                catch((error) => {
                    this.activity = [];
                    /* istanbul ignore next */
                    if (error.response) {
                        this.displayNotification("error", error.response.data.message);
                    } else {
                        this.displayNotification("error", error.message);
                    }
                });
        },
        getRequests () {
            /* istanbul ignore next */
            const { userName } = this.$root.userStore.state,
                query = "?_sortKeys=user&_queryFilter=true",
                selfServiceInstance = this.getRequestService(),
                url = `${this.amDataEndpoints.baseUrl + userName}/uma/pendingrequests${query}`;

            /* istanbul ignore next */
            // By default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
            selfServiceInstance.get(url, { "withCredentials": true }).then((response) => {
                this.requests = map(response.data.result, (request) => {
                    const resource = find(this.resources, { "name": request.resource });

                    if (has(resource, "icon_uri")) {
                        // eslint-disable-next-line camelcase
                        request.icon_uri = resource.icon_uri;
                    }

                    if (has(resource, "scopes")) {
                        request.scopes = resource.scopes;
                    }

                    request.allowed = false;
                    request.decision = false;

                    return request;
                });
            }).
                catch((error) => {
                    /* istanbul ignore next */
                    this.requests = {};

                    if (error.response) {
                        this.displayNotification("error", error.response.data.message);
                    } else {
                        this.displayNotification("error", error.message);
                    }
                });
        },
        getResources () {
            /* istanbul ignore next */
            const { userName } = this.$root.userStore.state,
                query = "?_queryId=*",
                selfServiceInstance = this.getRequestService(),
                url = this.amDataEndpoints.baseUrl + userName + this.amDataEndpoints.resourceSet + query;

            /* istanbul ignore next */
            // By default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
            selfServiceInstance.get(url, { "withCredentials": true }).then((response) => {
                this.resources = response.data.result;
                this.requestsLoaded = true;
            }).
                catch((error) => {
                    /* istanbul ignore next */
                    this.resources = [];
                    this.requestsLoaded = true;

                    if (error.response) {
                        this.displayNotification("error", error.response.data.message);
                    } else {
                        this.displayNotification("error", error.message);
                    }
                });
        },
        loadData () {
            this.getResources();
            this.getActivity();
            this.getRequests();
        },
        modifyResource (resourceId, payload, config = {}) {
            const headers = { "Accept-API-Version": "protocol=1.0,resource=1.0" },
                selfServiceInstance = this.getRequestService(),
                successMessage = config.unshare ? this.$t("common.user.sharing.unshareSuccess") : this.$t("common.user.sharing.modifySuccess"),
                { userName } = this.$root.userStore.state,
                url = `${this.amDataEndpoints.baseUrl + userName}/uma/policies/${resourceId}`;

            selfServiceInstance.put(url, payload, { headers, "withCredentials": true }).
                then((response) => {
                    if (config.onSuccess) {
                        config.onSuccess();
                    }

                    this.displayNotification("success", successMessage);
                    this.loadData();
                }).
                catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification("error", error.response.data.message);
                });
        },
        renderShareModal (resource) {
            this.resource = resource;
            this.$nextTick(() => {
                this.$root.$emit("bv::show::modal", "shareModal");
            });
        },
        renderUnshareModal (resourceName, resourceId) {
            this.resourceName = resourceName;
            this.resourceId = resourceId;
            this.$nextTick(() => {
                this.$root.$emit("bv::show::modal", "unshareModal");
            });
        },
        shareResource (payload, config = {}) {
            /* istanbul ignore next */
            const { userName } = this.$root.userStore.state,
                selfServiceInstance = this.getRequestService(),
                successMessage = this.$t("common.user.sharing.shareSuccess"),
                url = `${this.amDataEndpoints.baseUrl + userName}/uma/policies/${payload.policyId}`;

            /* istanbul ignore next */
            selfServiceInstance.put(url, payload, { "withCredentials": true }).then((response) => {
                if (config.onSuccess) {
                    config.onSuccess();
                }
                this.displayNotification("success", successMessage);
                this.loadData();
            }).
                catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification("error", error.response.data.message);
                });
        },
        testForReload () {
            if (this.delayedUpdate === true) {
                this.delayedUpdate = false;

                this.loadData();
            }
        },
        unshareResource (resourceId) {
            /* istanbul ignore next */
            const { userName } = this.$root.userStore.state,
                selfServiceInstance = this.getRequestService(),
                successMessage = this.$t("common.user.sharing.unshareSuccess"),
                url = `${this.amDataEndpoints.baseUrl + userName}/uma/policies/${resourceId}`;

            /* istanbul ignore next */
            selfServiceInstance.delete(url, { "withCredentials": true }).then((response) => {
                this.displayNotification("success", successMessage);
                this.loadData();
            }).
                catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification("error", error.response.data.message);
                });
        }
    }
};
</script>

<style lang='scss' scoped>
</style>
