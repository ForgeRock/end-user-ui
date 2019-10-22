<template>
    <fr-list-group v-show="oauthApplications" :title="$t('pages.profile.oauthApplications.title')" :subtitle="$t('pages.profile.oauthApplications.subtitle')">
        <template v-if="oauthApplications.length > 0">
            <fr-list-item v-for="(application, id) in oauthApplications" :key="id"
                :collapsible="false"
                :panelShown="false">
                <div slot="list-item-header" class="d-inline-flex w-100">
                    <div class="d-flex mr-3 align-self-top">
                        <img :src="application.logo_uri || require('@/assets/images/authorized-app.svg')" width="25"/>
                    </div>
                    <div class="flex-grow-1">
                        <div>
                            {{application._id}}
                        </div>
                        <small class="text-muted subtext">{{$t('pages.profile.oauthApplications.expires')}} {{getExpirationDateString(application)}}</small>
                    </div>
                    <a class="align-self-center flex-grow-2 text-right" @click.prevent="showConfirmationModal(application)" href="#">{{$t('common.form.remove')}}</a>
                </div>
            </fr-list-item>
        </template>
        <template v-else>
            <b-list-group-item class="noncollapse text-center">
                {{$t('pages.profile.oauthApplications.noApplications')}}
            </b-list-group-item>
        </template>

        <b-modal id="authAppConfirmationModal" class="" ref="fsModal" cancel-variant="outline-secondary">
            <div slot="modal-header" class="d-flex w-100 h-100">
                <h6 class="my-0">{{ $t('common.form.confirm') }}</h6>
                <button type="button" aria-label="Close" class="close" @click="$refs.fsModal.hide()"><i class="fa fa-times"></i></button>
            </div>
            {{ $t('pages.profile.oauthApplications.removeConfirmation', {applicationName: confirmApplication.name }) }}
            <div slot="modal-footer">
                <div class="float-right">
                    <b-btn variant="outline-secondary mr-2" @click="$refs.fsModal.hide()">{{$t('common.form.cancel')}}</b-btn>
                    <b-btn type="button" variant="danger" @click="removeApplication(confirmApplication.id)">{{$t('common.form.remove')}}</b-btn>
                </div>
            </div>
        </b-modal>
    </fr-list-group>
</template>

<script>
import ListGroup from '@/components/utils/ListGroup';
import ListItem from '@/components/utils/ListItem';

/**
* @description If fullstack (AM/IDM) is configured will work with authorized applications endpoiint (AM) and display a list of currently tied applications.
* It is possible to also remove these applications though if you attempt to remove openIDM it will always re-add since this is needed to ensure fullstack works.
*
*/
export default {
    name: 'Authorized-Applications',
    components: {
        'fr-list-group': ListGroup,
        'fr-list-item': ListItem
    },
    data () {
        return {
            oauthApplications: {},
            confirmApplication: {
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
        getExpirationDateString (application) {
            if (application.expiryDateTime) {
                return new Date(application.expiryDateTime).toUTCString();
            } else {
                return this.$t('pages.profile.oauthApplications.never');
            }
        },
        loadData () {
            /* istanbul ignore next */
            let userName = this.$root.userStore.state.userName,
                query = '?_queryId=*',
                selfServiceInstance = this.getRequestService(),
                url = this.$root.applicationStore.state.amDataEndpoints.baseUrl + userName + this.$root.applicationStore.state.amDataEndpoints.oauthApplications + query;

            /* istanbul ignore next */
            // by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
            selfServiceInstance.get(url, { withCredentials: true }).then((response) => {
                this.oauthApplications = response.data.result;
            })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification('error', error.response.data.message);
                });
        },
        showConfirmationModal (application) {
            this.confirmApplication.id = application._id;
            this.$refs.fsModal.show();
        },
        removeApplication (applicationId) {
            /* istanbul ignore next */
            let userName = this.$root.userStore.state.userName,
                selfServiceInstance = this.getRequestService(),
                url = this.$root.applicationStore.state.amDataEndpoints.baseUrl + userName + this.$root.applicationStore.state.amDataEndpoints.oauthApplications + applicationId;

            /* istanbul ignore next */
            // by default CORS requests don't allow cookies, the 'withCredentials: true' flag allows it
            selfServiceInstance.delete(url, { withCredentials: true }).then(() => {
                this.displayNotification('success', this.$t('pages.profile.oauthApplications.removeSuccess', { applicationName: this.confirmApplication.id }));
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
