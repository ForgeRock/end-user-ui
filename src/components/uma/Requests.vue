<template>
    <div>
        <template>
            <div id="listView">
                <b-card no-body class="mt-4">
                    <b-list-group flush>
                        <b-list-group-item v-for="(request, index) in requests" :key="index">
                            <div class="d-sm-flex">
                                <div class="media-body align-self-center mb-2 mb-sm-0">
                                    <div class="mb-2"><small><strong>{{request.user}}</strong> {{$t('pages.uma.requests.requestedAccess')}}</small></div>
                                    <div class="media mb-1">
                                        <div class="d-flex mr-2 align-self-center">
                                            <fr-fallback-image v-if="request.icon_uri" :src="request.icon_uri" height="30" width="30" fallback="fa-file-alt"></fr-fallback-image>
                                        </div>
                                        <div class="media-body align-self-center">
                                            <div class="media-body align-self-center">
                                                {{request.resource}}
                                            </div>
                                        </div>
                                    </div>
                                    <small class="text-muted">{{request.when | formatTime}}</small>
                                </div>
                                <div class="d-flex justify-content-start ml-sm-3 align-self-center" v-if="!request.decision">
                                    <a href="#" class="pr-3" @click="finalizeAccess(request, index, 'approve')">{{$t('pages.uma.requests.allow')}}</a>
                                    <a href="#" class="px-2" @click="finalizeAccess(request, index, 'deny')">{{$t('pages.uma.requests.deny')}}</a>
                                </div>
                                <div class="d-flex justify-content-start ml-sm-3 align-self-center" v-if="request.decision">
                                    <div class="allow text-success" v-if="request.allowed">
                                        <i class="fa fa-check fa-fw"></i> {{$t('pages.uma.requests.allowed')}}
                                    </div>
                                    <div class="deny text-danger" v-if="!request.allowed">
                                        <i class="fa fa-ban fa-fw"></i> {{$t('pages.uma.requests.denied')}}
                                    </div>
                                </div>
                            </div>
                        </b-list-group-item>
                    </b-list-group>
                </b-card>
            </div>
        </template>
    </div>
</template>

<script>
import moment from 'moment';
import FallbackImage from '@/components/utils/FallbackImage';

/**
 * @description Allows user to request access to a resource
 *
 **/
export default {
    name: 'Requests',
    components: {
        'fr-fallback-image': FallbackImage
    },
    props: ['requests'],
    filters: {
        formatTime (dateString) {
            let eventDate = moment(dateString);

            if (eventDate.isSame(moment(), 'day')) {
                return eventDate.fromNow();
            } else {
                return eventDate.format('LT');
            }
        }
    },
    methods: {
        finalizeAccess (request, index, action) {
            this.requests[index].decision = true;

            this.$emit('finalizeResourceAccess', request._id, action, {
                scopes: request.permissions,
                onSuccess: () => {
                    if (action === 'approve') {
                        this.requests[index].allowed = true;
                    }
                }
            });
        }
    }
};
</script>

<style lang="scss" scoped>
</style>
