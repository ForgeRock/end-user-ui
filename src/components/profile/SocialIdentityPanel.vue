<template>
    <div>
        <div v-if="showAccountDetails" class="row mb-4">
            <strong class="col fr-social-details-title">
                {{ $t('pages.profile.socialSignIn.linkedAccount') }}
            </strong>
            <div class="col-8">
                <div class="media">
                    <b-img :src="photoUrl" rounded="circle" width="40" height="40" alt="img" class="my-auto mr-3" />
                    <div class="media-body">
                        <strong class="fr-social-details-title d-block mb-0">{{ profile.displayName }}</strong>
                        <span v-show="accountDisplayName" class="text-muted">{{ accountDisplayName }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <strong class="col fr-social-details-title">
                {{ $t('pages.profile.socialSignIn.sharing') }}
            </strong>
            <div class="col-8 text-muted">
                <span v-for="(scope, index) in provider.scope" :key="`scopes-${index}`" class="d-block py-1">
                    <i class="fa fa-check text-success mr-2" />
                    {{ capitalize(scope) }}
                </span>
            </div>
        </div>
    </div>
</template>
<script>
import { capitalize, first, has, isEmpty, set } from "lodash";

/**
 * @description Display component for each configured social provider
 *
 * @fires POST identityProviders?_action=normalizeProfile - Returns a nromalized set of data for social providers, this is used to provide additional display such as profile picture from Facebook or Google.
 *
 */
export default {
    "name": "Social-Identity-Panel",
    // eslint-disable-next-line sort-keys
    "computed": {
        accountDisplayName () {
            return this.profile.email || this.profile.username;
        },
        photoUrl () {
            // eslint-disable-next-line global-require
            return this.profile.photoUrl || require("@/assets/images/profile-default.png");
        },
        showAccountDetails () {
            const profileHasDisplayName = has(this.profile, "displayName"),
                profileHasEmailOrUsername = has(this.profile, "email") || has(this.profile, "username"),
                profileNotEmtpy = !isEmpty(this.profile);

            return profileNotEmtpy && (profileHasDisplayName || profileHasEmailOrUsername);
        }
    },
    data () {
        return { "profile": {} };
    },
    // eslint-disable-next-line sort-keys
    created () {
        // istanbul ignore next
        this.getRequestService().
            post("identityProviders?_action=normalizeProfile", this.getProfileRequestPayload()).
            then(({ data }) => {
                this.profile = first(data);
            });
    },
    "methods": {
        capitalize,
        getProfileRequestPayload () {
            const rawProfile = this.provider.propertyMap.reduce((result, mapping) => set(result, mapping.source, this.provider[mapping.source]), {});

            // eslint-disable-next-line no-underscore-dangle
            rawProfile._refResourceCollection = this.provider._refResourceCollection;

            return { rawProfile };
        }
    },
    "props": ["provider"]
};
</script>
