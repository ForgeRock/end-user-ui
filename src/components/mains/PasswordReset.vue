<template>
    <fr-center-card :showLogo="true">
        <div slot="center-card-header">
            <h2 class="h2">{{$t(`pages.selfservice.headers.reset.title`)}}</h2>
        </div>

        <b-card-body slot="center-card-body">
            <component ref="selfServiceStage"
                v-if="selfServiceType !== null && selfServiceType !== 'parameters'"
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
    import EmailValidation from '../selfservice/common/EmailValidation';
    import ResetStage from '../selfservice/passwordreset/ResetStage';
    import SelfserviceAPI from '../selfservice/mixins/SelfserviceAPIMixin';
    import UserQuery from '../selfservice/common/UserQuery';

    export default {
        name: 'Password-Reset',
        components: {
            captcha: Captcha,
            emailValidation: EmailValidation,
            userQuery: UserQuery,
            resetStage: ResetStage,
            'bounce-loader': BounceLoader,
            'fr-center-card': CenterCard
        },
        data () {
            return {
                selfServiceType: null,
                selfServiceDetails: null,
                loadingColor: styles.baseColor,
                apiType: 'reset'
            };
        },
        mounted () {
            /* istanbul ignore next */
            if (this.$route.params.queryParams) {
                let queryParams = this.parseQueryParams(this.$route.params.queryParams);
                // hide the params from the user
                this.$router.push('/passwordReset');
                this.advanceStage(queryParams);
            } else {
                this.loadData();
            }
        },
        methods: {
            setChildComponent (type, details) {
                this.selfServiceDetails = details;

                if (type === 'parameters') {
                    this.selfServiceType = null;
                    this.advanceStage({});
                } else {
                    this.selfServiceType = type;
                }
            },
            apiErrorCallback (error) {
                this.setChildComponent('resetStage', { error: error.response.data.message });
            },
            parseQueryParams (queryParams) {
                /*
                    example =>
                    queryParams = '&token=MY_TOKEN&code=MY_CODE'
                    returns {
                        token: 'MY_TOKEN',
                        code: 'MY_CODE'
                    }
                */
                return JSON.parse(
                    `{
                        ${decodeURI('"' + queryParams.slice(1).replace(/&/g, '","').replace(/=/g, '":"')) + '"'}
                    }`
                );
            }
        },
        mixins: [
            SelfserviceAPI
        ]
    };
</script>
