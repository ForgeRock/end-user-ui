<template>
    <fr-center-card v-if="selfServiceType !== null" :show-logo="true">
        <div slot="center-card-header">
            <h2 class="h2">{{ $t(`pages.selfservice.headers.username.title`) }}</h2>
        </div>

        <b-card-body slot="center-card-body">
            <component
                :is="selfServiceType"
                ref="selfServiceStage"
                :self-service-details="selfServiceDetails"
                :api-type="apiType"
                @advanceStage="advanceStage"
            />
        </b-card-body>

        <b-card-footer slot="center-card-footer">
            <b-link href="#/login">{{ $t("pages.selfservice.signIn") }}</b-link>
        </b-card-footer>
    </fr-center-card>

    <b-container v-else fluid class="h-100 px-0">
        <div class="h-100 d-flex">
            <div class="m-auto fr-center-card">
                <bounce-loader :color="loadingColor" />
            </div>
        </div>
    </b-container>
</template>

<script>
import { each, toLower } from "lodash";
// eslint-disable-next-line import/extensions
import { BounceLoader } from "vue-spinner/dist/vue-spinner.min.js";
import styles from "../../../scss/main.scss";
import CenterCard from "../../utils/CenterCard";
import Captcha from "../common/Captcha";
import EmailUsername from "./EmailUsername";
import GenericSelfService from "../common/GenericSelfService";
import RetrieveUsername from "./RetrieveUsername";
import SelfserviceAPI from "../mixins/SelfserviceAPIMixin";
import UserQuery from "../common/UserQuery";

/**
 * @description Selfservice controlling component for retrieving a forgotten username. Makes use of selfservice-username.json config file.
 *
 * @mixin - selfservice/mixins/SelfserviceAPIMixin.vue
 */
export default {
    "name": "Forgot-Username",
    // eslint-disable-next-line sort-keys
    "components": {
        Captcha,
        EmailUsername,
        GenericSelfService,
        RetrieveUsername,
        UserQuery,
        "bounce-loader": BounceLoader,
        "fr-center-card": CenterCard
    },
    data () {
        return {
            "apiType": "username",
            "loadingColor": styles.baseColor,
            "selfServiceDetails": null,
            "selfServiceType": null
        };
    },
    "methods": {
        apiErrorCallback (error) {
            /* istanbul ignore next */
            this.setChildComponent("retrieveUsername", { "error": error.response.data.message });
        },
        setChildComponent (type, details) {
            this.selfServiceDetails = details;

            let stageCheck = false;

            each(this.$options.components, (value, key) => {
                if (toLower(key) === toLower(type)) {
                    stageCheck = true;
                }
            });

            if (stageCheck) {
                this.selfServiceType = type;
            } else {
                this.selfServiceType = "GenericSelfService";
            }
        }
    },
    "mixins": [SelfserviceAPI],
    mounted () {
        /* istanbul ignore next */
        this.loadData();
    }
};
</script>
