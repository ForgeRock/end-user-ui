<template>
    <fr-center-card :showLogo="true" v-if="showForm">
        <div slot="center-card-header">
            <h2 class="h2">{{displayName}}</h2>
        </div>

        <b-card-body slot="center-card-body">
            <p class='text-center mb-4'>
                {{purpose}}
            </p>
            <component ref="selfServiceStage"
                :is="selfServiceType"
                :selfServiceDetails="selfServiceDetails"
                @advanceStage="advanceStage"
                :apiType="apiType">
            </component>
        </b-card-body>

        <b-card-footer slot="center-card-footer" v-if="selfServiceDetails !== null && selfServiceDetails.canSkip">
            <a href="#" @click.prevent="advanceStage({}, true)">
                {{$t('pages.selfservice.progressiveProfile.skipThis')}}
            </a>
        </b-card-footer>
    </fr-center-card>

    <b-container fluid class="h-100 px-0"  v-else>
        <div class="h-100 d-flex">
            <div class="m-auto fr-center-card">
                <bounce-loader :color="loadingColor"></bounce-loader>
            </div>
        </div>
    </b-container>
</template>

<script>
import _ from 'lodash';
import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min.js';
import styles from '@/scss/main.scss';
import CenterCard from '@/components/utils/CenterCard';
import axios from 'axios';
import conditionaluser from '@/components/selfservice/progressiveprofile/ConditionalUser';
import SelfserviceAPI from '@/components/selfservice/mixins/SelfserviceAPIMixin';

/**
 * @description Selfservice controlling component for resource progressive profiling. Makes use of selfservice-profile.json config file.
 *
 * @mixin - selfservice/mixins/SelfserviceAPIMixin.vue
 *
 * @fires POST authentication?_action=login - Since progressive profiling creates a partial session, once it is complete we call login again with the
 * original JWT to continue the authentication session
 */
export default {
    name: 'Progressive-Profile',
    components: {
        'bounce-loader': BounceLoader,
        'fr-center-card': CenterCard,
        conditionaluser
    },
    mixins: [
        SelfserviceAPI
    ],
    data () {
        return {
            selfServiceType: null,
            selfServiceDetails: null,
            loadingColor: styles.baseColor,
            apiType: null,
            purpose: null,
            displayName: null,
            showForm: false
        };
    },
    mounted () {
        /* istanbul ignore next */
        this.apiType = this.$route.params.profileProcess;
        /* istanbul ignore next */
        this.loadData();
    },
    methods: {
        setChildComponent (type, details) {
            this.selfServiceDetails = details;
            this.selfServiceType = type;

            if (_.isEmpty(details.requirements) && details.tag === 'initial') {
                this.advanceStage({
                    'input': {}
                });
            } else if (_.has(details, 'requirements.uiConfig')) {
                this.showForm = true;
                this.displayName = details.requirements.uiConfig.displayName;
                this.purpose = details.requirements.uiConfig.purpose;
                // Can skip the stage by default
                this.selfServiceDetails.canSkip = true;
                /* If there are any kba questions, terms and conditions,
                       or required attributes the stage cannot be skipped */
                if (
                    _.has(details, 'requirements.properties.kba') ||
                        _.has(details, 'requirements.terms') ||
                        (
                            _.has(details.requirements, 'attributes') &&
                            _.filter(details.requirements.attributes, { isRequired: true }).length >= 1
                        )
                ) {
                    this.selfServiceDetails.canSkip = false;
                }
            } else if (details.tag === 'end' && details.status.success) {
                this.showForm = false;
                /* istanbul ignore next */
                this.setUser();
            }
        },
        apiErrorCallback (error) {
            /* istanbul ignore next */
            this.displayNotification('error', error.response.data.message);
            /* istanbul ignore next */
            this.loadData();
        },
        setUser () {
            /* istanbul ignore next */
            let loginServiceInstance = this.getRequestService({
                headers: this.getAnonymousHeaders()
            });
                /* istanbul ignore next */
            loginServiceInstance.post('/authentication?_action=login').then((userDetails) => {
                // Check for progressive profiling.
                this.progressiveProfileCheck(userDetails, () => {
                    /* istanbul ignore next */
                    axios.all([
                        loginServiceInstance.get(`${userDetails.data.authorization.component}/${userDetails.data.authorization.id}`),
                        loginServiceInstance.post(`privilege?_action=listPrivileges`),
                        loginServiceInstance.get(`schema/${userDetails.data.authorization.component}`)]).then(axios.spread((profile, privilege, schema) => {
                        this.$root.userStore.setProfileAction(profile.data);
                        this.$root.userStore.setSchemaAction(schema.data);
                        this.$root.userStore.setAccess(privilege.data);

                        this.completeLogin();
                    }))
                        .catch((error) => {
                            /* istanbul ignore next */
                            this.displayNotification('error', error.response.data.message);
                        });
                }, true);
            })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification('error', error.response.data.message);
                });
        }
    }
};
</script>
