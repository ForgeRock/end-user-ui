<template>
    <fr-center-card :showLogo="true" v-if="selfServiceType !== null">
        <div slot="center-card-header">
            <h2 class="h2">{{$t(`pages.selfservice.headers.username.title`)}}</h2>
        </div>

        <b-card-body slot="center-card-body">
            <component ref="selfServiceStage"
                :is="selfServiceType"
                :selfServiceDetails="selfServiceDetails"
                @advanceStage="advanceStage"
                :apiType="apiType">
            </component>
        </b-card-body>

        <b-card-footer slot="center-card-footer">
            <b-link href="#/login">{{$t("pages.selfservice.signIn")}}</b-link>
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
import Captcha from '@/components/selfservice/common/Captcha';
import EmailUsername from '@/components/selfservice/forgotusername/EmailUsername';
import GenericSelfService from '@/components/selfservice/common/GenericSelfService';
import RetrieveUsername from '@/components/selfservice/forgotusername/RetrieveUsername';
import SelfserviceAPI from '@/components/selfservice/mixins/SelfserviceAPIMixin';
import UserQuery from '@/components/selfservice/common/UserQuery';

/**
 * @description Selfservice controlling component for retrieving a forgotten username. Makes use of selfservice-username.json config file.
 *
 * @mixin - selfservice/mixins/SelfserviceAPIMixin.vue
 */
export default {
    name: 'Forgot-Username',
    components: {
        Captcha,
        EmailUsername,
        RetrieveUsername,
        UserQuery,
        GenericSelfService,
        'bounce-loader': BounceLoader,
        'fr-center-card': CenterCard
    },
    data () {
        return {
            selfServiceType: null,
            selfServiceDetails: null,
            loadingColor: styles.baseColor,
            apiType: 'username'
        };
    },
    mounted () {
        /* istanbul ignore next */
        this.loadData();
    },
    methods: {
        setChildComponent (type, details) {
            this.selfServiceDetails = details;

            let stageCheck = false;

            _.each(this.$options.components, (value, key) => {
                if (_.toLower(key) === _.toLower(type)) {
                    stageCheck = true;
                }
            });

            if (stageCheck) {
                this.selfServiceType = type;
            } else {
                this.selfServiceType = 'GenericSelfService';
            }
        },
        apiErrorCallback (error) {
            /* istanbul ignore next */
            this.setChildComponent('retrieveUsername', { error: error.response.data.message });
        }
    },
    mixins: [
        SelfserviceAPI
    ]
};
</script>
