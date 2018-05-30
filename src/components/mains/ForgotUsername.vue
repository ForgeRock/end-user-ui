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
    import styles from '@/scss/main.scss';
    import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min.js';
    import Captcha from '../selfservice/common/Captcha';
    import CenterCard from '@/components/utils/CenterCard';
    import EmailUsername from '../selfservice/forgotusername/EmailUsername';
    import RetrieveUsername from '../selfservice/forgotusername/RetrieveUsername';
    import SelfserviceAPI from '../selfservice/mixins/SelfserviceAPIMixin';
    import UserQuery from '../selfservice/common/UserQuery';

    export default {
        name: 'Forgot-Username',
        components: {
            captcha: Captcha,
            emailUsername: EmailUsername,
            retrieveUsername: RetrieveUsername,
            userQuery: UserQuery,
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

                this.selfServiceType = type;
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
