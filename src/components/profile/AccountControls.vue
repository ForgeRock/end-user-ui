<template>
    <div>
        <fr-list-group :title="$t('pages.profile.accountControls.title')" :subtitle="$t('pages.profile.accountControls.subtitle')">
            <fr-list-item
                    :collapsible="false"
                    :panelShown="false"
                    :hoverItem="true"
                    @row-click="downloadAccount">
                <div slot="list-item-header" class="d-inline-flex w-100">
                    <div class="flex-grow-1">
                        <div>
                            {{$t('pages.profile.accountControls.downloadTitle')}}
                        </div>
                        <small class="text-muted subtext">{{$t('pages.profile.accountControls.downloadSubtitle')}}</small>
                    </div>
                    <a class="align-self-center flex-grow-2 text-right" @click.prevent href="#">{{$t('pages.profile.accountControls.downloadLink')}}</a>
                </div>
            </fr-list-item>
            <fr-list-item
                    :collapsible="false"
                    :panelShown="false"
                    :hoverItem="true"
                    v-b-modal.deleteAccountModal>
                <div slot="list-item-header" class="d-inline-flex w-100">
                    <div class="flex-grow-1">
                        <div>
                            {{$t('pages.profile.accountControls.deleteTitle')}}
                        </div>
                        <small class="text-muted subtext">{{$t('pages.profile.accountControls.deleteSubtitle')}}</small>
                    </div>
                    <a class="align-self-center flex-grow-2 text-right" @click.prevent href="#">{{$t('pages.profile.accountControls.deleteAccount')}}</a>
                </div>
            </fr-list-item>
        </fr-list-group>
        <b-modal id="deleteAccountModal" class="fr-full-screen" ref="deleteModal" cancel-variant="outline-secondary">
            <div slot="modal-header" class="d-flex w-100 h-100">
                <h5 class="modal-title align-self-center text-center">{{$t('pages.profile.accountControls.deleteModalTitle')}}</h5>
                <button type="button" aria-label="Close" class="close" @click="hideModal"><i class="fa fa-times"></i></button>
            </div>

            <b-container>
                <h1 class="mb-4">{{$t('pages.profile.accountControls.deleteModalHeader')}}</h1>
                <p>
                    {{$t('pages.profile.accountControls.deleteModalDetails')}}
                </p>
                <hr/>
                <p>
                    {{$t('pages.profile.accountControls.deleteModalDownload1')}} <a @click.prevent="downloadAccount" href="#">{{$t('pages.profile.accountControls.deleteModalDownload2')}}</a> {{$t('pages.profile.accountControls.deleteModalDownload3')}}
                </p>
                <hr/>
                <h5>{{$t('pages.profile.accountControls.deleteModalContentList')}}</h5>
                <ul>
                    <li>{{$t('pages.profile.accountControls.deleteModalContentListItem')}}</li>
                </ul>
                <div class="custom-control custom-checkbox">
                    <input type="checkbox" v-model="confirmDelete" class="custom-control-input" id="confirmDeleteCheck">
                    <label class="custom-control-label" for="confirmDeleteCheck">{{$t('pages.profile.accountControls.deleteModalAcceptMessage')}}</label>
                </div>
            </b-container>

            <div slot="modal-footer" class="w-100">
                <div class="float-right">
                    <b-btn variant="outline-secondary" @click="hideModal">{{$t('common.form.cancel')}}</b-btn>
                    <b-btn :disabled="!confirmDelete" type="button" variant="danger" @click="deleteAccount">{{$t('pages.profile.accountControls.deleteModalButton')}}</b-btn>
                </div>
            </div>
        </b-modal>
    </div>
</template>

<script>
    import ListGroup from '@/components/utils/ListGroup';
    import ListItem from '@/components/utils/ListItem';
    import _ from 'lodash';

    export default {
        name: 'Account-Controls',
        components: {
            'fr-list-group': ListGroup,
            'fr-list-item': ListItem
        },
        data: function () {
            return {
                confirmDelete: false
            };
        },
        mounted: function () {},
        methods: {
            deleteAccount () {
                /* istanbul ignore next */
                let selfServiceInstance = this.getRequestService({
                    headers: {
                        'content-type': 'application/json',
                        'cache-control': 'no-cache',
                        'x-requested-with': 'XMLHttpRequest'
                    }
                });

                /* istanbul ignore next */
                selfServiceInstance.delete(`managed/user/${this.$root.userStore.state.userId}`).then(() => {
                    this.$refs.deleteModal.hide();

                    selfServiceInstance.post('/authentication?_action=logout').then(() => {
                        this.displayNotification('success', this.$t('pages.profile.accountControls.deleteAccountSuccessful'));

                        this.$root.userStore.clearStoreAction();

                        this.$router.push('/login');
                    });
                });
            },
            downloadAccount () {
                let selfServiceInstance = this.getRequestService({
                    headers: {
                        'content-type': 'application/json',
                        'cache-control': 'no-cache',
                        'x-requested-with': 'XMLHttpRequest'
                    }
                });

                /* istanbul ignore next */
                selfServiceInstance.get(`/${this.$root.userStore.state.managedResource}/${this.$root.userStore.state.userId}?_fields=*,idps/*,_meta/createDate,_meta/lastChanged,_meta/termsAccepted,_meta/loginCount`, []).then((result) => {
                    let data,
                        downloadName = '';

                    if (result.data._meta) {
                        _.each(result._meta, (value, key) => {
                            if (key.match('_')) {
                                delete result._meta[key];
                            }
                        });
                    }

                    if (result.data.idps) {
                        _.each(result.idps, (idp) => {
                            _.each(idp, (value, key) => {
                                if (key.match('_') && _.isNull(key.match('_meta'))) {
                                    delete idp[key];
                                }
                            });
                        });
                    }

                    delete result.data._rev;
                    delete result.data.kbaInfo;

                    data = JSON.stringify(result.data, null, 4);

                    if (navigator.msSaveBlob) {
                        return navigator.msSaveBlob(new Blob([data], {type: 'data:application/json'}), downloadName);
                    } else {
                        const blob = new Blob([data], {type: 'data:application/json'}),
                            e = document.createEvent('MouseEvents'),
                            a = document.createElement('a');

                        a.download = 'userProfile.json';
                        a.href = window.URL.createObjectURL(blob);
                        a.dataset.downloadurl = ['data:application/json', a.download, a.href].join(':');
                        e.initEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                        a.dispatchEvent(e);
                    }
                });
            },
            hideModal () {
                this.$refs.deleteModal.hide();
            }
        }
    };
</script>

<style lang="scss" scoped>
    @import '../../scss/full-screen-modal';
</style>