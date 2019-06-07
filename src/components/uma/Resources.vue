<template>
    <div>
        <template>
            <div class="btn-toolbar row mb-4" role="toolbar" aria-label="Toolbar with button groups">
                <div class="input-group col-sm-4">
                    <div class="input-group-prepend">
                        <div class="input-group-text" id="btnGroupAddon"><i class="fa fa-search"></i></div>
                    </div>
                    <input type="text" class="form-control" aria-label="Search" aria-describedby="btnGroupAddon"
                        :placeholder="$t('pages.uma.resources.search')"  v-model="resourceFilter">
                </div>
                <div class="col">
                    <b-dropdown variant="link" right  class="float-right text-muted">
                        <template slot="button-content">
                            <span class="text-muted">
                                <i class="fa fa-list" v-if="!this.viewgrid"></i>
                                <i class="fa fa-th" v-if="this.viewgrid"></i>
                            </span>
                        </template>
                        <b-dropdown-header>{{$t('pages.uma.resources.viewAs')}}</b-dropdown-header>
                        <b-dropdown-item href="#" @click="toggleGrid">
                            <div class="media">
                                <div class="d-flex align-self-center text-center" style="min-width:1.5rem;">
                                    <i class="fa fa-check text-success" v-if="!this.viewgrid"></i>
                                </div>
                                <div class="media-body">{{$t('pages.uma.resources.list')}}</div>
                                <div class="d-flex ml-3 align-self-center text-muted">
                                    <i class="fa fa-list"></i>
                                </div>
                            </div>
                        </b-dropdown-item>
                        <b-dropdown-item href="#" @click="toggleGrid">
                            <div class="media">
                                <div class="d-flex align-self-center text-center" style="min-width:1.5rem;">
                                    <i class="fa fa-check text-success" v-if="this.viewgrid"></i>
                                </div>
                                <div class="media-body">{{$t('pages.uma.resources.grid')}}</div>
                                <div class="d-flex ml-3 align-self-center text-muted">
                                    <i class="fa fa-th"></i>
                                </div>
                            </div>
                        </b-dropdown-item>
                    </b-dropdown>
                </div>
            </div>
            <div id="listView" v-if="!this.viewgrid">
                <b-card no-body class="my-4">
                    <b-list-group flush>
                        <b-list-group-item v-for="(resource, index) in filteredResources" :key="`listResource-${index}`">
                            <div class="d-sm-flex">
                                <div class="media-body">
                                    <div class="media mb-2 mb-sm-0">
                                        <div class="d-flex mr-3 align-self-top">
                                            <fr-fallback-image
                                                :src="resource.icon_uri"
                                                :height="40"
                                                :width="40"
                                                fallback="fa-file-alt fa-2x m-auto pt-1 pb-1"></fr-fallback-image>
                                        </div>
                                        <div class="d-sm-flex media-body align-self-center">
                                            <div class="media-body mb-2 mb-sm-0">
                                                <div class="my-0">{{resource.name}}</div>
                                                <small class="text-muted" v-if="!resource.policy">{{$t('pages.uma.resources.resourceNotShared')}}</small>
                                                <small class="text-muted" v-else-if="resource.policy.permissions.length > 1">{{ $t('pages.uma.resources.sharedWithPeople', {numberOf: resource.policy.permissions.length}) }}</small>
                                                <small class="text-muted" v-else>{{$t('pages.uma.resources.sharedWithPerson')}}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="d-flex justify-content-start justify-content-sm-start ml-sm-3 align-self-center">
                                    <div class="d-sm-none">
                                        <a href="#" class="align-self-center pr-3" @click="renderShareModal(resource)">{{$t('pages.uma.resources.share')}}</a>
                                        <a href="#" class="align-self-center pr-3" @click="renderUnshareModal(resource.name, resource._id)">{{$t('pages.uma.resources.unshare')}}</a>
                                    </div>
                                    <div class="d-none d-sm-flex">
                                        <a href="#" class="align-self-center pr-3" @click="renderShareModal(resource)">{{$t('pages.uma.resources.share')}}</a>
                                        <a href="#" v-if="resource.policy && resource.policy.permissions.length > 0" class="align-self-center pr-3" @click="renderUnshareModal(resource.name, resource._id)">{{$t('pages.uma.resources.unshare')}}</a>
                                    </div>
                                </div>
                            </div>
                        </b-list-group-item>
                    </b-list-group>
                </b-card>
            </div>
            <div id="gridView" v-if="this.viewgrid">
                <div class="row">
                  <div v-for="(resource, index) in filteredResources" :key="`viewResource-${index}`"  class="col-sm-6 col-md-3">
                        <div class="card text-center mb-4">
                            <div class="card-header py-0 px-1 border-0">
                                <b-dropdown variant="link" class="fr-card-menu-link float-right" right no-caret>
                                    <template slot="button-content">
                                        <span class="text-muted"><i class="fa fa-ellipsis-h"></i></span>
                                    </template>
                                    <b-dropdown-item href="#" @click="renderShareModal(resource)">{{$t('pages.uma.resources.share')}}</b-dropdown-item>
                                    <b-dropdown-item href="#" @click="renderUnshareModal(resource.name, resource._id)">{{$t('pages.uma.resources.unshare')}}</b-dropdown-item>
                                </b-dropdown>
                            </div>
                            <div class="card-body pt-0">
                                <fr-fallback-image :src="resource.icon_uri" :width="86" :height="86" class="pl-5 pr-5 pt-3 mb-3" fallback="fa-file-alt fa-3x m-auto pt-3 pb-3"></fr-fallback-image>
                                <h5 class="card-title text-truncate">{{resource.name}}</h5>
                                <div class="card-text">
                                    <small class="text-muted" v-if="!resource.policy">{{$t('pages.uma.resources.resourceNotShared')}}</small>
                                    <small class="text-muted" v-else-if="resource.policy.permissions.length > 1">{{ $t('pages.uma.resources.sharedWithPeople', {numberOf: resource.policy.permissions.length}) }}</small>
                                    <small class="text-muted" v-else>{{$t('pages.uma.resources.sharedWithPerson')}}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import _ from 'lodash';
import FallbackImage from '@/components/utils/FallbackImage';

/**
* @description Component for displaying a resource
*
**/
export default {
    name: 'Resources',
    components: {
        'fr-fallback-image': FallbackImage
    },
    data () {
        return {
            viewgrid: false,
            showModalActions: false,
            newshare: '',
            resourceFilter: ''
        };
    },
    props: ['resources'],
    methods: {
        renderShareModal (resource) {
            this.$emit('renderShareModal', resource);
        },
        renderUnshareModal (resourceName, resourceId) {
            this.$emit('renderUnshareModal', resourceName, resourceId);
        },
        toggleGrid () {
            this.viewgrid = !this.viewgrid;
        }
    },
    computed: {
        filteredResources () {
            return _.filter(this.resources, (resource) => { return resource.name.includes(this.resourceFilter); });
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
