<template>
    <fr-list-group v-show="mappings.length" :title="$t('pages.profile.consent.title')" :subtitle="$t('pages.profile.consent.subtitle')">
        <fr-list-item
            v-for="mapping in mappings"
            :key="mapping.name"
            :collapsible="mapping.consented"
            :panel-shown="false"
        >
            <template slot="list-item-header" class="overflow:hidden;">
                <fr-fallback-image :src="mapping.icon" class="mr-3" width="24" height="24" :alt="mapping.name" fallback="fa-cog" />
                <div class="media-body" style="width: 100%">
                    <div class="d-block">
                        <h6 class="my-0">{{ mapping.displayName }}</h6>
                        <small class="text-muted">{{ mapping.subTitle }}</small>
                    </div>
                </div>

                <div class="d-flex align-self-right">
                    <b-button type="button" variant="link" @click.stop.prevent="showModal(mapping.name)">
                        {{ $t(`pages.profile.consent.${mapping.consented ? 'deny' : 'allow'}`) }}
                    </b-button>
                    <div v-if="mapping.consented" class="caret ml-2 my-auto">
                        <i class="fa fa-angle-down fa-lg pr-0 caret-down align-self-center" />
                        <i class="fa fa-angle-up fa-lg pr-0 pt-1 caret-up align-self-center" />
                    </div>
                </div>

                <b-modal :id="mapping.name" :ref="mapping.name" size="md" cancel-variant="outline-secondary">
                    <div slot="modal-header" class="d-flex w-100 h-100">
                        <h5 class="modal-title align-self-center text-center">{{ mapping.modalHeader }}</h5>
                        <button type="button" aria-label="Close" class="close" @click.stop.prevent="hideModal(mapping.name)"><i class="fa fa-times" /></button>
                    </div>

                    <b-container>
                        <p v-if="mapping.consented" v-html="$t('pages.profile.consent.confirmDeny', {mappingName: mapping.displayName})" />
                        <fr-access-level v-else :fields="mapping.fields" />
                    </b-container>

                    <div slot="modal-footer">
                        <div class="float-right">
                            <b-btn variant="outline-secondary mr-2" @click.stop.prevent="hideModal(mapping.name)">{{ $t('common.form.cancel') }}</b-btn>
                            <b-btn type="button" :variant="mapping.consented ? 'danger' : 'primary'" @click.stop.prevent="toggleConsentAndHideModal(mapping)">
                                {{ $t(`pages.profile.consent.${mapping.consented ? 'deny' : 'allow'}`) }}
                            </b-btn>
                        </div>
                    </div>
                </b-modal>
            </template>

            <div slot="list-item-collapse-body">
                <fr-access-level :fields="mapping.fields" />
            </div>
        </fr-list-item>
    </fr-list-group>
</template>

<script>
import { find, first, isUndefined } from "lodash";
import AccessLevel from "./AccessLevel";
import FallbackImage from "../utils/FallbackImage";
import ListGroup from "../utils/ListGroup";
import ListItem from "../utils/ListItem";
import moment from "moment";

/**
 * @description Controls the display of a users currently consented mappings (where their data is sent).
 *
 * @fires POST consent?_action=getConsentMappings - Gets a list of available mappings for consent in conjunction with the consent portion of a users profile this is
 * used to display which mappings are consented to and can be consented out of.
 *
 */
export default {
    "name": "Consent",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-access-level": AccessLevel,
        "fr-fallback-image": FallbackImage,
        "fr-list-group": ListGroup,
        "fr-list-item": ListItem
    },
    "computed": {
        mappings () {
            // eslint-disable-next-line max-statements
            return this.consentableMappings.map((mapping) => {
                const consentedMapping = find(this.consentedMappings, { "mapping": mapping.name });
                let modalHeaderPath = "pages.profile.consent.";

                mapping.showDetails = false;

                if (isUndefined(consentedMapping)) {
                    mapping.consented = false;
                    modalHeaderPath += "allowConsentHeader";
                    mapping.subTitle = this.$t("pages.profile.consent.notAuthorized");
                } else {
                    mapping.consented = true;
                    mapping.consentDate = consentedMapping.consentDate;
                    modalHeaderPath += "denyConsentHeader";
                    mapping.subTitle = `${this.$t("pages.profile.consent.authorized")} ${moment(mapping.consentDate).format("MMMM Do YYYY")}`;
                }

                mapping.modalHeader = this.$t(modalHeaderPath);
                return mapping;
            });
        }
    },
    data () {
        return {
            "consentableMappings": []
        };
    },
    // eslint-disable-next-line sort-keys
    created () {
        /* istanbul ignore next */
        this.getRequestService().
            get(`consent?_queryFilter=/source eq "${this.$root.userStore.state.managedResource}"`).
            then(({ data }) => {
                this.consentableMappings = data.result;
            });
    },
    "methods": {
        generatePatch (mapping) {
            const { consentDate, name } = mapping,
                value = {
                    consentDate,
                    "mapping": name
                };
            let field = "/consentedMappings",
                operation = "";

            if (mapping.consented) {
                operation = "remove";
            } else {
                value.consentDate = new Date().toISOString();
                field += "/-";
                operation = "add";
            }

            return [{ field, operation, value }];
        },
        hideModal (name) {
            first(this.$refs[name]).hide();
        },
        showModal (name) {
            first(this.$refs[name]).show();
        },
        toggleConsent (mapping, event) {
            this.$emit("updateProfile", this.generatePatch(mapping));
        },
        toggleConsentAndHideModal (mapping) {
            this.toggleConsent(mapping);
            this.hideModal(mapping.name);
        }
    },
    "props": ["consentedMappings"]
};
</script>
