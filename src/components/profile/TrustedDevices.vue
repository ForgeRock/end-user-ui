<template>
    <fr-list-group v-show="devices" :title="$t('pages.profile.trustedDevices.title')" :subtitle="$t('pages.profile.trustedDevices.subtitle')">
        <template v-if="devices.length > 0">
            <fr-list-item
                v-for="(device, id) in devices"
                :key="id"
                :collapsible="false"
                :panel-shown="false"
            >
                <div slot="list-item-header" class="d-inline-flex w-100">
                    <div class="d-flex mr-3 align-self-top">
                        <fr-fallback-image :src="device.logo_uri" fallback="fa-tv m-auto pt-1 pb-1" />
                    </div>
                    <div class="flex-grow-1">
                        <div>
                            {{ device.name }}
                        </div>
                        <small class="text-muted subtext">{{ device.lastSelectedDate }}</small>
                    </div>
                    <a class="align-self-center flex-grow-2 text-right" href="#" @click.prevent="showConfirmationModal(device)">{{ $t('common.form.remove') }}</a>
                </div>
            </fr-list-item>
        </template>
        <template v-else>
            <b-list-group-item class="noncollapse text-center">
                {{ $t('pages.profile.trustedDevices.noDevices') }}
            </b-list-group-item>
        </template>

        <b-modal id="trustedDevicesConfirmationModal" ref="fsModal" class="" cancel-variant="outline-secondary">
            <div slot="modal-header" class="d-flex w-100 h-100">
                <h6 class="my-0">{{ $t('common.form.confirm') }}</h6>
                <button type="button" aria-label="Close" class="close" @click="$refs.fsModal.hide()"><i class="fa fa-times" /></button>
            </div>
            {{ $t('pages.profile.trustedDevices.removeConfirmation', {deviceName: confirmDevice.name }) }}
            <div slot="modal-footer">
                <div class="float-right">
                    <b-btn variant="outline-secondary mr-2" @click="$refs.fsModal.hide()">{{ $t('common.form.cancel') }}</b-btn>
                    <b-btn type="button" variant="danger" @click="removeDevice(confirmDevice.id)">{{ $t('common.form.remove') }}</b-btn>
                </div>
            </div>
        </b-modal>
    </fr-list-group>
</template>

<script>
import FallbackImage from "../utils/FallbackImage";
import ListGroup from "../utils/ListGroup";
import ListItem from "../utils/ListItem";

/**
 * @description If fullstack (AM/IDM) is configured will work with authorized devices endpoiint (AM) and display a list of currently of authorized devices for the current
 * user. This will also allow a user to remove an authorized device, causing the next login session of that device to trigger the appropriate device authorization flow from AM.
 *
 */
export default {
    "name": "Trusted-Devices",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-fallback-image": FallbackImage,
        "fr-list-group": ListGroup,
        "fr-list-item": ListItem
    },
    data () {
        return {
            "confirmDevice": {
                "id": null,
                "name": ""
            },
            "devices": {}
        };
    },
    "methods": {
        loadData () {
            /* istanbul ignore next */
            const { userName } = this.$root.userStore.state,
                query = "?_queryId=*",
                selfServiceInstance = this.getRequestService(),
                url = this.$root.applicationStore.state.amDataEndpoints.baseUrl + userName + this.$root.applicationStore.state.amDataEndpoints.trustedDevices + query;

            /* istanbul ignore next */
            // By default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
            selfServiceInstance.get(url, { "withCredentials": true }).then((response) => {
                this.devices = response.data.result;
            }).
                catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification("error", error.response.data.message);
                });
        },
        removeDevice (deviceId) {
            /* istanbul ignore next */
            const { userName } = this.$root.userStore.state,
                selfServiceInstance = this.getRequestService(),
                url = this.$root.applicationStore.state.amDataEndpoints.baseUrl + userName + this.$root.applicationStore.state.amDataEndpoints.trustedDevices + deviceId;

            /* istanbul ignore next */
            // By default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
            selfServiceInstance.delete(url, { "withCredentials": true }).then(() => {
                this.displayNotification("success", this.$t("pages.profile.trustedDevices.removeSuccess", { "deviceName": this.confirmDevice.name }));
                this.loadData();
                this.$refs.fsModal.hide();
            }).
                catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification("error", error.response.data.message);
                });
        },
        showConfirmationModal (device) {
            this.confirmDevice.id = device.uuid;
            this.confirmDevice.name = device.name;
            this.$refs.fsModal.show();
        }
    },
    mounted () {
        /* istanbul ignore next */
        this.loadData();
    }
};
</script>

<style scoped>
</style>
