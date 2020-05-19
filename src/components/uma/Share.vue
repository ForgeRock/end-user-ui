<template>
    <b-modal id="shareModal" ref="fsModal" class="" cancel-variant="outline-secondary" @keydown.enter.native.prevent="validateResource" @hide="resetModal">
        <div slot="modal-header" class="d-flex w-100 h-100">
            <div class="media">
                <div class="d-flex mr-3 align-self-center">
                    <fr-fallback-image :src="resource.icon_uri" :height="40" :width="40" fallback="fa-file-alt" />
                </div>
                <div class="media-body align-self-center">
                    <h6 class="my-0">{{ resource.name }}</h6>
                    <small v-if="!resource.policy" class="text-muted">{{ $t('pages.uma.resources.resourceNotShared') }}</small>
                    <small v-else-if="resource.policy.permissions.length > 1" class="text-muted">{{ $t('pages.uma.resources.sharedWithPeople', {numberOf: resource.policy.permissions.length}) }}</small>
                    <small v-else class="text-muted">{{ $t('pages.uma.resources.sharedWithPerson') }}</small>
                </div>
            </div>
            <button type="button" aria-label="Close" class="close" @click="hideModal"><i class="fa fa-times" /></button>
        </div>

        <div class="form-group">
            <b-input-group>
                <b-form-input v-model="newShare" :placeholder="$t('pages.uma.resources.shareWith')" />
                <b-dropdown slot="append" :text="text" variant="outline-secondary" size="sm">
                    <form class="px-4 py-2" @click.stop>
                        <template v-if="resource.scopes">
                            <div v-for="(scope, index) in resource.scopes" :key="index" class="form-check mb-1">
                                <input id="viewCheck" type="checkbox" class="form-check-input mr-1" :checked="newScopes[scope]" @click="newScopes[scope] = !newScopes[scope]">
                                <label class="form-check-label" for="viewCheck">{{ scope }}</label>
                            </div>
                        </template>
                    </form>
                </b-dropdown>
            </b-input-group>
        </div>

        <div :class="[{'d-none': newShare}]">
            <ul v-if="resource.policy && resource.policy.permissions" class="list-unstyled">
                <li v-for="(permission, index) of resource.policy.permissions" :key="index" class="media py-2">
                    <b-img :src="require('@/assets/images/profile-default.png')" rounded="circle" width="34" height="34" alt="avatar" class="mr-3" />
                    <div class="media-body">
                        <h6 class="mt-2">{{ permission.subject }}</h6>
                    </div>
                    <div class="d-flex ml-3 align-self-center">
                        <b-dropdown id="ddown1" :text="text" variant="link" size="sm" right toggle-class="dropdown-toggle">
                            <template slot="button-content" class="dropdown-toggle">
                                <span class="d-none d-sm-inline">Can {{ permission.scopes.join(", ") }}</span>
                            </template>
                            <form class="px-4 py-2" @click.stop>
                                <div v-for="(value, scope) in newScopes" :key="scope" class="form-check mb-1">
                                    <input id="viewCheck" type="checkbox" class="form-check-input mr-1" :checked="permission.scopes.includes(scope)" @click="modifyResource(permission.subject, scope)">
                                    <label class="form-check-label" for="viewCheck">{{ scope }}</label>
                                </div>
                            </form>
                            <b-dropdown-divider />
                            <b-dropdown-item><span role="button" class="text-danger" @click="unshareOne(permission.subject)">{{ $t('pages.uma.resources.unshare') }}</span></b-dropdown-item>
                        </b-dropdown>
                    </div>
                </li>
            </ul>
        </div>

        <div slot="modal-footer" class="w-100">
            <div>
                <b-button type="button" variant="link" @click="unshareAll">{{ $t('pages.uma.resources.unshareAll') }}</b-button>
                <div v-if="newShare" class="float-right">
                    <b-button type="button" variant="outline-secondary mr-2" @click="hideModal">{{ $t('pages.uma.resources.cancel') }}</b-button>
                    <b-button type="button" variant="primary" @click="validateResource">{{ $t('pages.uma.resources.share') }}</b-button>
                </div>
            </div>
        </div>
    </b-modal>
</template>

<script>
import { each, filter, findIndex, keys, map, pickBy } from "lodash";
import FallbackImage from "../utils/FallbackImage";

/**
 * @description Dialog for sharing a resource with users
 *
 */
export default {
    "name": "Share",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-fallback-image": FallbackImage
    },
    data () {
        return {
            "newScopes": {},
            "newShare": false,
            "text": `Can ${this.resource.scopes[0]}`
        };
    },
    // eslint-disable-next-line sort-keys
    created () {
        this.setNewScopes();
    },
    "methods": {
        hideModal () {
            this.$refs.fsModal.hide();
            this.resetModal();
        },
        modifyResource (subject, changedScope) {
            const newPermissions = map(
                    this.resource.policy.permissions,
                    (permission) => {
                        if (permission.subject === subject) {
                            const scopesLength = permission.scopes.length;

                            permission.scopes = filter(permission.scopes, (scope) => scope !== changedScope);

                            if (scopesLength === permission.scopes.length) {
                                permission.scopes.push(changedScope);
                            }
                        }

                        return permission;
                    }
                ),
                payload = {
                    "permissions": newPermissions,
                    // eslint-disable-next-line no-underscore-dangle
                    "policyId": this.resource._id
                };

            // eslint-disable-next-line no-underscore-dangle
            this.$emit("modifyResource", this.resource._id, payload);
        },
        resetModal () {
            this.newShare = "";
            this.setNewScopes();
        },
        setNewScopes () {
            each(this.resource.scopes, (scope) => {
                this.newScopes[scope] = true;
            });
        },
        shareResource () {
            const newScopes = keys(pickBy(this.newScopes)),
                onSuccess = this.resetModal.bind(this),
                payload = {
                    "permissions": [],
                    // eslint-disable-next-line no-underscore-dangle
                    "policyId": this.resource._id
                },
                subject = this.newShare,
                // eslint-disable-next-line sort-vars
                newPermissions = { "scopes": newScopes, subject };

            // Resource has previously been shared
            if (this.resource.policy) {
                payload.permissions = this.resource.policy.permissions.filter((object) => object.subject !== subject);
                payload.permissions.push(newPermissions);

                // eslint-disable-next-line no-underscore-dangle
                this.$emit("modifyResource", this.resource._id, payload, { onSuccess });
            } else {
                payload.permissions.push(newPermissions);

                this.$emit("shareResource", payload, { onSuccess });
            }

            this.hideModal();
        },
        unshareAll () {
            // eslint-disable-next-line no-underscore-dangle
            this.$emit("renderUnshareModal", this.resource.name, this.resource._id);
            this.hideModal();
        },
        unshareOne (subject) {
            const onSuccess = this.resetModal.bind(this),
                // Filter subject out of current permissions array
                permissions = this.resource.policy.permissions.filter((object) => object.subject !== subject),
                // eslint-disable-next-line sort-vars
                payload = {
                    permissions,
                    // eslint-disable-next-line no-underscore-dangle
                    "policyId": this.resource._id
                };

            // eslint-disable-next-line no-underscore-dangle
            this.$emit("modifyResource", this.resource._id, payload, { onSuccess, "unshare": true });
            this.hideModal();
        },
        validateResource () {
            // Resource has already been shared
            if (this.resource.policy && this.resource.policy.permissions) {
                const index = findIndex(this.resource.policy.permissions, (perm) => perm.subject === this.newShare);

                if (index === -1) {
                    if (this.newShare) {
                        this.shareResource();
                    } else {
                        this.displayNotification("error", this.$t("pages.uma.resources.noRequestingParty"));
                    }
                    // Attempting to share with user who already has access to resource
                } else {
                    this.displayNotification("error", this.$t("pages.uma.resources.sameShareError", { "requestingParty": this.newShare }));
                    this.resetModal();
                }
                // Shared for first time
            } else if (!this.resource.policy && this.newShare) {
                this.shareResource();
            }
        }
    },
    "props": ["resource"],
    "watch": {
        resource () {
            // istanbul ignore next
            this.setNewScopes();
        }
    }
};
</script>

<style lang="scss" scoped>
    span {
        display: block;
        text-align: center;
    }
</style>
