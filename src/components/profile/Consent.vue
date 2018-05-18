<template>
    <fr-list-group v-show="mappings.length" :title="$t('pages.profile.consent.title')" :subtitle="$t('pages.profile.consent.subtitle')">
        <fr-list-item v-for="mapping in mappings" :key="mapping.name"
            :collapsible="mapping.consented"
            :panelShown="false">

            <template slot="list-item-header">
                    <b-img :src="mapping.icon" class="mr-3" width="24" height="24" :alt="mapping.name" @error="imageLoadErrorHandler"/>
                    <div class="media-body" style="width: 100%">
                        <div class="d-block">
                            <h6 class="my-0">{{mapping.displayName}}</h6>
                            <small class="text-muted">{{mapping.subTitle}}</small>
                        </div>
                    </div>

                    <div class="d-flex align-self-right">
                        <b-button type="button" variant="link" @click.stop.prevent="showModal(mapping.name)">
                            {{$t(`pages.profile.consent.${mapping.consented ? 'deny' : 'allow'}`)}}
                        </b-button>
                        <div class="caret ml-2 my-auto"  v-if="mapping.consented">
                            <i class="fa fa-angle-down fa-lg pr-0 caret-down align-self-center"></i>
                            <i class="fa fa-angle-up fa-lg pr-0 pt-1 caret-up align-self-center"></i>
                        </div>
                    </div>

                    <b-modal :id="mapping.name" :ref="mapping.name" size="md" cancel-variant="outline-secondary">
                        <div slot="modal-header" class="d-flex w-100 h-100">
                            <h5 class="modal-title align-self-center text-center">{{mapping.modalHeader}}</h5>
                            <button type="button" aria-label="Close" class="close" @click.stop.prevent="hideModal(mapping.name)"><i class="fa fa-times"></i></button>
                        </div>

                        <b-container>
                            <p v-if="mapping.consented" v-html="$t('pages.profile.consent.confirmDeny', {mappingName: mapping.displayName})"></p>
                            <fr-access-level v-else :fields="mapping.fields"></fr-access-level>
                        </b-container>
                        
                        <div slot="modal-footer">
                            <div class="float-right">
                                <b-btn variant="outline-secondary" @click.stop.prevent="hideModal(mapping.name)">{{$t('common.form.cancel')}}</b-btn>
                                <b-btn type="button" :variant="mapping.consented ? 'danger' : 'primary'" @click.stop.prevent="toggleConsentAndHideModal(mapping)">
                                    {{$t(`pages.profile.consent.${mapping.consented ? 'deny' : 'allow'}`)}}
                                </b-btn>
                            </div>
                        </div>
                    </b-modal>
            </template>

            <div slot="list-item-collapse-body">
                <fr-access-level :fields="mapping.fields"></fr-access-level>
            </div>
        </fr-list-item>
    </fr-list-group>
</template>

<script>
    import _ from 'lodash';
    import moment from 'moment';
    import ListGroup from '@/components/utils/ListGroup';
    import ListItem from '@/components/utils/ListItem';
    import AccessLevel from './AccessLevel';

    export default {
        name: 'Consent',
        components: {
            'fr-list-group': ListGroup,
            'fr-list-item': ListItem,
            'fr-access-level': AccessLevel
        },
        props: [ 'consentedMappings' ],
        data () {
            return {
                consentableMappings: []
            };
        },
        computed: {
            mappings () {
                return this.consentableMappings.map((mapping) => {
                    let consentedMapping = _.find(this.consentedMappings, { mapping: mapping.name }),
                        modalHeaderPath = 'pages.profile.consent.';

                    mapping.showDetails = false;

                    if (!_.isUndefined(consentedMapping)) {
                        mapping.consented = true;
                        mapping.consentDate = consentedMapping.consentDate;
                        modalHeaderPath += 'denyConsentHeader';
                        mapping.subTitle = `${this.$t('pages.profile.consent.authorized')} ${moment(mapping.consentDate).format('MMMM Do YYYY')}`;
                    } else {
                        mapping.consented = false;
                        modalHeaderPath += 'allowConsentHeader';
                        mapping.subTitle = this.$t('pages.profile.consent.notAuthorized');
                    }

                    mapping.modalHeader = this.$t(modalHeaderPath);
                    return mapping;
                });
            }
        },
        created () {
            const headers = {
                'content-type': 'application/json',
                'cache-control': 'no-cache',
                'x-requested-with': 'XMLHttpRequest'
            };

            /* istanbul ignore next */
            this.getRequestService({headers})
                .post('consent?_action=getConsentMappings')
                .then(({data}) => {
                    this.consentableMappings = data;
                });
        },
        methods: {
            imageLoadErrorHandler (event) {
                event.target.src = 'static/image/mapping-default.svg';
            },
            showModal (name) {
                _.first(this.$refs[name]).show();
            },
            toggleConsentAndHideModal (mapping) {
                this.toggleConsent(mapping);
                this.hideModal(mapping.name);
            },
            hideModal (name) {
                _.first(this.$refs[name]).hide();
            },
            generatePatch (mapping) {
                let { consentDate, name } = mapping,
                    value = {
                        consentDate,
                        mapping: name
                    },
                    field = '/consentedMappings',
                    operation;

                if (!mapping.consented) {
                    value.consentDate = new Date().toISOString();
                    field += '/-';
                    operation = 'add';
                } else {
                    operation = 'remove';
                }

                return [{ field, operation, value }];
            },
            toggleConsent (mapping, event) {
                /* istanbul ignore next */
                let userId = this.$root.userStore.state.userId,
                    selfServiceInstance = this.getRequestService({
                        headers: {
                            'content-type': 'application/json',
                            'cache-control': 'no-cache',
                            'x-requested-with': 'XMLHttpRequest'
                        }
                    }),
                    patch = this.generatePatch(mapping);

                /* istanbul ignore next */
                selfServiceInstance.patch(`managed/user/${userId}`, patch).then((response) => {
                    this.$root.userStore.setProfileAction(response.data);

                    /* istanbul ignore next */
                    this.displayNotification('success', this.$t('common.user.profile.updateSuccess'));
                })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification('error', error.response.data.message);
                });
            }
        }
    };
</script>
