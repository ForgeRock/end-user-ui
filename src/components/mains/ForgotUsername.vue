<template>
    <fr-center-card :showLogo="true">
        <div slot="center-card-header">
            <h2 class="h2">{{$t(`pages.selfservice.headers.username.title`)}}</h2>
        </div>

        <b-card-body slot="center-card-body">
            <component ref="selfServiceStage"
                v-if="selfServiceType !== null"
                :is="selfServiceType"
                :selfServiceDetails="selfServiceDetails"
                @advanceStage="advanceStage"
                :apiType="apiType">
            </component>

            <bounce-loader v-else :color="loadingColor"></bounce-loader>
        </b-card-body>

        <b-card-footer slot="center-card-footer">
            <b-link href="#/login">{{$t("pages.selfservice.signIn")}}</b-link>
        </b-card-footer>
    </fr-center-card>
</template>

<script>
    import styles from '@/scss/main.scss';
    import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min.js';
    import Captcha from '../selfservice/common/Captcha';
    import CenterCard from '@/components/utils/CenterCard';
    import EmailUsername from '../selfservice/forgotUsername/EmailUsername';
    import RetrieveUsername from '../selfservice/forgotUsername/RetrieveUsername';
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
        data: function () {
            return {
                selfServiceType: null,
                selfServiceDetails: null,
                loadingColor: styles.baseColor,
                apiType: 'username'
            };
        },
        mounted: function () {
            /* istanbul ignore next */
            this.loadData();
        },
        methods: {
            setChildComponent: function (type, details) {
                this.selfServiceDetails = details;

                this.selfServiceType = type;
            },
            apiErrorCallback: function (error) {
                /* istanbul ignore next */
                this.setChildComponent('retrieveUsername', { error: error.response.data.message });
            }
        },
        mixins: [
            SelfserviceAPI
        ]
    };
</script>
