<template>
    <fr-list-group v-show="devices && devices.length" :title="$t('pages.profile.trustedDevices.title')" :subtitle="$t('pages.profile.trustedDevices.subtitle')">
        <fr-list-item v-for="(device, id) in devices" :key="id"
            :collapsible="false"
            :panelShown="false">

            <div slot="list-item-header" class="d-inline-flex w-100">
                <div class="d-flex mr-3 align-self-top">
                    <fr-fallback-image :src="device.logo_uri" fallback="fa-television fa-2x m-auto pt-1 pb-1"></fr-fallback-image>
                </div>
                <div class="flex-grow-1">
                    <div>
                        {{device.name}}
                    </div>
                    <small class="text-muted subtext">{{device.lastSelectedDate}}</small>
                </div>
                <a class="align-self-center flex-grow-2 text-right" @click.prevent="showConfirmationModal(device)" href="#">{{$t('common.form.remove')}}</a>
            </div>
        </fr-list-item>


        <b-modal id="confirmationModal" class="" ref="fsModal" cancel-variant="outline-secondary">
            <div slot="modal-header" class="d-flex w-100 h-100">
                <h6 class="my-0">{{ $t('common.form.confirm') }}</h6>
                <button type="button" aria-label="Close" class="close" @click="$refs.fsModal.hide()"><i class="fa fa-times"></i></button>
            </div>
            {{ $t('pages.profile.trustedDevices.removeConfirmation', {deviceName: confirmDevice.name }) }}
            <div slot="modal-footer">
                <div class="float-right">
                    <b-btn variant="outline-secondary" @click="$refs.fsModal.hide()">{{$t('common.form.cancel')}}</b-btn>
                    <b-btn type="button" variant="danger" @click="removeDevice(confirmDevice.id)">{{$t('common.form.remove')}}</b-btn>
                </div>
            </div>
        </b-modal>
    </fr-list-group>
</template>

<script>
    import ListGroup from '@/components/utils/ListGroup';
    import ListItem from '@/components/utils/ListItem';
    import FallbackImage from '@/components/utils/FallbackImage';

    export default {
        name: 'Trusted-Devices',
        components: {
            'fr-list-group': ListGroup,
            'fr-list-item': ListItem,
            'fr-fallback-image': FallbackImage
        },
        data () {
            return {
                devices: {},
                confirmDevice: {
                    name: '',
                    id: null
                }
            };
        },
        mounted () {
            /* istanbul ignore next */
            this.loadData();
        },
        methods: {
            loadData () {
                /* istanbul ignore next */
                let userName = this.$root.userStore.state.userName,
                    query = '?_queryId=*',
                    selfServiceInstance = this.getRequestService(),
                    url = this.$root.applicationStore.state.amDataEndpoints.baseUrl + userName + this.$root.applicationStore.state.amDataEndpoints.trustedDevices + query;

                /* istanbul ignore next */
                // by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
                selfServiceInstance.get(url, { withCredentials: true }).then((response) => {
                    this.devices = response.data.result;
                })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification('error', error.response.data.message);
                });
            },
            showConfirmationModal (device) {
                this.confirmDevice.id = device.uuid;
                this.confirmDevice.name = device.name;
                this.$refs.fsModal.show();
            },
            removeDevice (deviceId) {
                /* istanbul ignore next */
                let userName = this.$root.userStore.state.userName,
                    selfServiceInstance = this.getRequestService(),
                    url = this.$root.applicationStore.state.amDataEndpoints.baseUrl + userName + this.$root.applicationStore.state.amDataEndpoints.trustedDevices + deviceId;

                /* istanbul ignore next */
                // by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
                selfServiceInstance.delete(url, { withCredentials: true }).then(() => {
                    this.displayNotification('success', this.$t('pages.profile.trustedDevices.removeSuccess', { deviceName: this.confirmDevice.name }));
                    this.loadData();
                    this.$refs.fsModal.hide();
                })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification('error', error.response.data.message);
                });
            }
        }
    };
</script>

<style scoped>
</style>
