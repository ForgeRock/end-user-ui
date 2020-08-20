<template>
<b-modal id="shareModal" class="" ref="fsModal" cancel-variant="outline-secondary" @keydown.enter.native.prevent="validateResource" @hide="resetModal">
      <div slot="modal-header" class="d-flex w-100 h-100">
            <div class="media">
                <div class="d-flex mr-3 align-self-center">
                    <fr-fallback-image :src="resource.icon_uri" :height="40" :width="40" fallback="fa-file-alt"></fr-fallback-image>
                </div>
                <div class="media-body align-self-center">
                    <h6 class="my-0">{{resource.name}}</h6>
                    <small class="text-muted" v-if="!resource.policy">{{$t('pages.uma.resources.resourceNotShared')}}</small>
                    <small class="text-muted" v-else-if="resource.policy.permissions.length > 1">{{ $t('pages.uma.resources.sharedWithPeople', {numberOf: resource.policy.permissions.length}) }}</small>
                    <small class="text-muted" v-else>{{$t('pages.uma.resources.sharedWithPerson')}}</small>
                </div>
            </div>
            <button type="button" aria-label="Close" class="close" @click="hideModal"><i class="fa fa-times"></i></button>
        </div>

      <div class="form-group">
            <b-input-group>
                <b-form-input :placeholder="$t('pages.uma.resources.shareWith')" v-model="newShare"></b-form-input>
                <b-dropdown :text="text" variant="outline-secondary" size="sm" slot="append">
                    <form class="px-4 py-2" @click.stop>
                        <template v-if="resource.scopes">
                            <div class="form-check mb-1" v-for="(scope, index) in resource.scopes" :key="index">
                                <input type="checkbox" class="form-check-input mr-1" id="viewCheck" :checked="newScopes[scope]" @click="newScopes[scope] = !newScopes[scope]">
                                <label class="form-check-label" for="viewCheck">{{scope}}</label>
                            </div>
                        </template>
                    </form>
                </b-dropdown>
            </b-input-group>
      </div>

      <div :class="[{'d-none': this.newShare}]">
          <ul class="list-unstyled" v-if="resource.policy && resource.policy.permissions">
              <li class="media py-2" v-for="(permission, index) of resource.policy.permissions" :key="index">
                  <b-img :src="require('@/assets/images/profile-default.png')" rounded="circle" width="34" height="34" alt="avatar" class="mr-3" />
                  <div class="media-body">
                    <h6 class="mt-2">{{permission.subject}}</h6>
                  </div>
                  <div class="d-flex ml-3 align-self-center">
                      <b-dropdown id="ddown1" :text="text" variant="link" size="sm" right toggle-class="dropdown-toggle">
                          <template slot="button-content" class="dropdown-toggle">
                              <span class="d-none d-sm-inline">Can {{permission.scopes.join(", ")}}</span>
                          </template>
                          <form class="px-4 py-2" @click.stop>
                                <div class="form-check mb-1" v-for="(value, scope) in newScopes" :key="scope">
                                    <input type="checkbox" class="form-check-input mr-1" id="viewCheck" :checked="permission.scopes.includes(scope)" @click="modifyResource(permission.subject, scope)">
                                    <label class="form-check-label" for="viewCheck">{{scope}}</label>
                                </div>
                            </form>
                          <b-dropdown-divider></b-dropdown-divider>
                          <b-dropdown-item><span role="button" class="text-danger" @click="unshareOne(permission.subject)">{{$t('pages.uma.resources.unshare')}}</span></b-dropdown-item>
                      </b-dropdown>
                  </div>
              </li>
          </ul>
      </div>

        <div slot="modal-footer" class="w-100">
            <div>
                <b-button type="button" variant="link" @click="unshareAll">{{$t('pages.uma.resources.unshareAll')}}</b-button>
                <div class="float-right" v-if="newShare">
                    <b-button type="button" variant="outline-secondary mr-2" @click="hideModal">{{$t('pages.uma.resources.cancel')}}</b-button>
                    <b-button type="button" variant="primary" @click="validateResource">{{$t('pages.uma.resources.share')}}</b-button>
                </div>
            </div>

        </div>
    </b-modal>
</template>

<script>
import _ from 'lodash';
import FallbackImage from '@/components/utils/FallbackImage';

/**
 * @description Dialog for sharing a resource with users
 *
 **/
export default {
    name: 'Share',
    components: {
        'fr-fallback-image': FallbackImage
    },
    props: ['resource'],
    data () {
        return {
            newShare: false,
            text: 'Can ' + this.resource.scopes[0],
            newScopes: {}
        };
    },
    created () {
        this.setNewScopes();
    },
    watch: {
        resource () {
            // istanbul ignore next
            this.setNewScopes();
        }
    },
    methods: {
        setNewScopes () {
            _.each(this.resource.scopes, (scope) => {
                this.newScopes[scope] = true;
            });
        },
        hideModal () {
            this.$refs.fsModal.hide();
            this.resetModal();
        },
        resetModal () {
            this.newShare = '';
            this.setNewScopes();
        },
        unshareOne (subject) {
            const onSuccess = this.resetModal.bind(this);

            // filter subject out of current permissions array
            let permissions = this.resource.policy.permissions.filter((obj) => {
                    return obj.subject !== subject;
                }),
                payload = {
                    'policyId': this.resource._id,
                    'permissions': permissions
                };

            this.$emit('modifyResource', this.resource._id, payload, { onSuccess: onSuccess, unshare: true });
            this.hideModal();
        },
        unshareAll () {
            this.$emit('renderUnshareModal', this.resource.name, this.resource._id);
            this.hideModal();
        },
        validateResource () {
            // resource has already been shared
            if (this.resource.policy && this.resource.policy.permissions) {
                let index = _.findIndex(this.resource.policy.permissions, (perm) => { return perm.subject === this.newShare; });

                if (index === -1) {
                    if (this.newShare) {
                        this.shareResource();
                    } else {
                        this.displayNotification('error', this.$t('pages.uma.resources.noRequestingParty'));
                    }
                    // attempting to share with user who already has access to resource
                } else {
                    this.displayNotification('error', this.$t('pages.uma.resources.sameShareError', { requestingParty: this.newShare }));
                    this.resetModal();
                }
                // shared for first time
            } else if (!this.resource.policy && this.newShare) {
                this.shareResource();
            }
        },
        shareResource () {
            const onSuccess = this.resetModal.bind(this);

            let subject = this.newShare,
                newScopes = _.keys(_.pickBy(this.newScopes)),
                newPermissions = { 'subject': subject, 'scopes': newScopes },
                payload = {
                    'policyId': this.resource._id,
                    'permissions': []
                };

            // resource has previously been shared
            if (this.resource.policy) {
                payload.permissions = this.resource.policy.permissions.filter((obj) => {
                    return obj.subject !== subject;
                });
                payload.permissions.push(newPermissions);

                this.$emit('modifyResource', this.resource._id, payload, { onSuccess });
            } else {
                payload.permissions.push(newPermissions);

                this.$emit('shareResource', payload, { onSuccess });
            }

            this.hideModal();
        },
        modifyResource (subject, changedScope) {
            let newPermissions = _.map(this.resource.policy.permissions,
                    (permission) => {
                        if (permission.subject === subject) {
                            let scopesLength = permission.scopes.length;

                            permission.scopes = _.filter(permission.scopes, (scope) => { return scope !== changedScope; });

                            if (scopesLength === permission.scopes.length) {
                                permission.scopes.push(changedScope);
                            }
                        }

                        return permission;
                    }),
                payload = {
                    'policyId': this.resource._id,
                    'permissions': newPermissions
                };

            this.$emit('modifyResource', this.resource._id, payload);
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
