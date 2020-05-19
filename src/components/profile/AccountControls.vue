<template>
    <div>
        <fr-list-group :title="$t('pages.profile.accountControls.title')" :subtitle="$t('pages.profile.accountControls.subtitle')">
            <fr-list-item
                :collapsible="false"
                :panel-shown="false"
                :hover-item="true"
                @row-click="downloadAccount"
            >
                <div slot="list-item-header" class="d-inline-flex w-100">
                    <div class="flex-grow-1">
                        <div>
                            {{ $t('pages.profile.accountControls.downloadTitle') }}
                        </div>
                        <small class="text-muted subtext">{{ $t('pages.profile.accountControls.downloadSubtitle') }}</small>
                    </div>
                    <a class="align-self-center flex-grow-2 text-right" href="#" @click.prevent>{{ $t('pages.profile.accountControls.downloadLink') }}</a>
                </div>
            </fr-list-item>
            <fr-list-item
                v-b-modal.deleteAccountModal
                :collapsible="false"
                :panel-shown="false"
                :hover-item="true"
            >
                <div slot="list-item-header" class="d-inline-flex w-100">
                    <div class="flex-grow-1">
                        <div>
                            {{ $t('pages.profile.accountControls.deleteTitle') }}
                        </div>
                        <small class="text-muted subtext">{{ $t('pages.profile.accountControls.deleteSubtitle') }}</small>
                    </div>
                    <a class="align-self-center flex-grow-2 text-right" href="#" @click.prevent>{{ $t('pages.profile.accountControls.deleteAccount') }}</a>
                </div>
            </fr-list-item>
        </fr-list-group>
        <b-modal id="deleteAccountModal" ref="deleteModal" modal-class="fr-full-screen" cancel-variant="outline-secondary">
            <div slot="modal-header" class="d-flex w-100 h-100">
                <h5 class="modal-title align-self-center text-center">{{ $t('pages.profile.accountControls.deleteModalTitle') }}</h5>
                <button type="button" aria-label="Close" class="close" @click="hideModal"><i class="fa fa-times" /></button>
            </div>

            <b-container>
                <h1 class="mb-4">{{ $t('pages.profile.accountControls.deleteModalHeader') }}</h1>
                <p>
                    {{ $t('pages.profile.accountControls.deleteModalDetails') }}
                </p>
                <hr>
                <p>
                    {{ $t('pages.profile.accountControls.deleteModalDownload1') }} <a href="#" @click.prevent="downloadAccount">{{ $t('pages.profile.accountControls.deleteModalDownload2') }}</a> {{ $t('pages.profile.accountControls.deleteModalDownload3') }}
                </p>
                <hr>
                <h5>{{ $t('pages.profile.accountControls.deleteModalContentList') }}</h5>
                <ul>
                    <li>{{ $t('pages.profile.accountControls.deleteModalContentListItem') }}</li>
                </ul>
                <div class="custom-control custom-checkbox">
                    <input id="confirmDeleteCheck" v-model="confirmDelete" type="checkbox" class="custom-control-input">
                    <label class="custom-control-label" for="confirmDeleteCheck">{{ $t('pages.profile.accountControls.deleteModalAcceptMessage') }}</label>
                </div>
            </b-container>

            <div slot="modal-footer" class="w-100">
                <div class="float-right">
                    <b-btn variant="outline-secondary mr-2" @click="hideModal">{{ $t('common.form.cancel') }}</b-btn>
                    <b-btn :disabled="!confirmDelete" type="button" variant="danger" @click="deleteAccount">{{ $t('pages.profile.accountControls.deleteModalButton') }}</b-btn>
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
import { each, isNull } from "lodash";
import ListGroup from "../utils/ListGroup";
import ListItem from "../utils/ListItem";

/**
 * @description Handles displaying basic account controls (delete and download).
 *
 * @fires DELETE resource/name/id (e.g. managed/user/fakeid) - Deletes specific resource record
 * @fires GET resource/name/id?_fields=*,idps/*,_meta/createDate,_meta/lastChanged,_meta/termsAccepted,_meta/loginCount (e.g. managed/user/fakeid) - Gets JSON data on a resource including certain meta data,
 * this is used to generate a downloadable file.
 *
 */
export default {
    "name": "Account-Controls",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-list-group": ListGroup,
        "fr-list-item": ListItem
    },
    data () {
        return {
            "confirmDelete": false
        };
    },
    "methods": {
        deleteAccount () {
            /* istanbul ignore next */
            const selfServiceInstance = this.getRequestService();

            /* istanbul ignore next */
            selfServiceInstance.delete(`/${this.$root.userStore.state.managedResource}/${this.$root.userStore.state.userId}`).then(() => {
                this.$refs.deleteModal.hide();
                this.displayNotification("success", this.$t("pages.profile.accountControls.deleteAccountSuccessful"));
                this.logoutUser();
            });
        },
        downloadAccount () {
            const selfServiceInstance = this.getRequestService();

            /* istanbul ignore next */
            selfServiceInstance.
                get(`/${this.$root.userStore.state.managedResource}/${this.$root.userStore.state.userId}?_fields=*,idps/*,_meta/createDate,_meta/lastChanged,_meta/termsAccepted,_meta/loginCount`, []).
                // eslint-disable-next-line max-statements
                then((result) => {
                    // eslint-disable-next-line no-underscore-dangle
                    if (result.data._meta) {
                        // eslint-disable-next-line no-underscore-dangle
                        each(result._meta, (value, key) => {
                            if (key.match("_")) {
                                // eslint-disable-next-line no-underscore-dangle
                                delete result._meta[key];
                            }
                        });
                    }

                    if (result.data.idps) {
                        each(result.idps, (idp) => {
                            each(idp, (value, key) => {
                                if (key.match("_") && isNull(key.match("_meta"))) {
                                    delete idp[key];
                                }
                            });
                        });
                    }

                    // eslint-disable-next-line no-underscore-dangle
                    delete result.data._rev;
                    delete result.data.kbaInfo;

                    const data = JSON.stringify(result.data, null, 4);

                    if (navigator.msSaveBlob) {
                        return navigator.msSaveBlob(new Blob([data], { "type": "data:application/json" }), "");
                    }

                    // eslint-disable-next-line one-var
                    const blob = new Blob([data], { "type": "data:application/json" }),
                        event = document.createEvent("MouseEvents"),
                        // eslint-disable-next-line sort-vars
                        element = document.createElement("a");

                    element.download = "userProfile.json";
                    element.href = window.URL.createObjectURL(blob);
                    element.dataset.downloadurl = ["data:application/json", element.download, element.href].join(":");
                    event.initEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    element.dispatchEvent(event);
                    return null;
                });
        },
        hideModal () {
            this.$refs.deleteModal.hide();
        }
    },
    mounted () {
        // Do nothing - empty function with a comment to trick eslint
    }
};
</script>

<style lang="scss" scoped>
    @import '../../scss/full-screen-modal';
</style>
