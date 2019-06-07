<template>
    <div>
        <div class="row mb-4" v-if="showAccountDetails">
            <strong class="col fr-social-details-title">
                {{$t('pages.profile.socialSignIn.linkedAccount')}}
            </strong>
            <div class="col-8">
                <div class="media">
                    <b-img :src="photoUrl" rounded="circle" width="40" height="40" alt="img" class="my-auto mr-3" />
                    <div class="media-body">
                        <strong class="fr-social-details-title d-block mb-0">{{profile.displayName}}</strong>
                        <span v-show="accountDisplayName" class="text-muted">{{accountDisplayName}}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <strong class="col fr-social-details-title">
                {{$t('pages.profile.socialSignIn.sharing')}}
            </strong>
            <div class="col-8 text-muted">
                <span class="d-block py-1" :key="`scopes-${index}`" v-for="(scope, index) in provider.scope">
                    <i class="fa fa-check text-success mr-2"></i>
                    {{capitalize(scope)}}
                </span>
            </div>
        </div>
    </div>
</template>
<script>
import _ from 'lodash';

/**
* @description Display component for each configured social provider
*
* @fires POST identityProviders?_action=normalizeProfile - Returns a nromalized set of data for social providers, this is used to provide additional display such as profile picture from Facebook or Google.
*
*/
export default {
    name: 'Social-Identity-Panel',
    props: ['provider'],
    data () {
        return { profile: {} };
    },
    created () {
        // istanbul ignore next
        this.getRequestService()
            .post('identityProviders?_action=normalizeProfile', this.getProfileRequestPayload())
            .then(({ data }) => {
                this.profile = _.first(data);
            });
    },
    methods: {
        getProfileRequestPayload () {
            let rawProfile = this.provider.propertyMap.reduce((result, mapping) => {
                return _.set(result, mapping.source, this.provider[mapping.source]);
            }, {});

            rawProfile._refResourceCollection = this.provider._refResourceCollection;

            return { rawProfile };
        },
        capitalize: _.capitalize
    },
    computed: {
        showAccountDetails () {
            let profileNotEmtpy = !_.isEmpty(this.profile),
                profileHasDisplayName = _.has(this.profile, 'displayName'),
                profileHasEmailOrUsername = _.has(this.profile, 'email') || _.has(this.profile, 'username');

            return profileNotEmtpy && (profileHasDisplayName || profileHasEmailOrUsername);
        },
        photoUrl () {
            return this.profile.photoUrl || require('@/assets/images/profile-default.png');
        },
        accountDisplayName () {
            return this.profile.email || this.profile.username;
        }
    }
};
</script>
