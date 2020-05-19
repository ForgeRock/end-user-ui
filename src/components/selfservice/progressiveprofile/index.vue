<template>
    <fr-center-card v-if="showForm" :show-logo="true">
        <div slot="center-card-header">
            <h2 class="h2">{{ displayName }}</h2>
        </div>

        <b-card-body slot="center-card-body">
            <p class="text-center mb-4">
                {{ purpose }}
            </p>
            <component
                :is="selfServiceType"
                ref="selfServiceStage"
                :self-service-details="selfServiceDetails"
                :api-type="apiType"
                @advanceStage="advanceStage"
            />
        </b-card-body>

        <b-card-footer v-if="selfServiceDetails !== null && selfServiceDetails.canSkip" slot="center-card-footer">
            <a href="#" @click.prevent="advanceStage({}, true)">
                {{ $t('pages.selfservice.progressiveProfile.skipThis') }}
            </a>
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
import { filter, has, isEmpty } from "lodash";
// eslint-disable-next-line import/extensions
import { BounceLoader } from "vue-spinner/dist/vue-spinner.min.js";
import styles from "../../../scss/main.scss";
import CenterCard from "../../utils/CenterCard";
import axios from "axios";
import conditionaluser from "./ConditionalUser";
import SelfserviceAPI from "../mixins/SelfserviceAPIMixin";

/**
 * @description Selfservice controlling component for resource progressive profiling. Makes use of selfservice-profile.json config file.
 *
 * @mixin - selfservice/mixins/SelfserviceAPIMixin.vue
 *
 * @fires POST authentication?_action=login - Since progressive profiling creates a partial session, once it is complete we call login again with the
 * original JWT to continue the authentication session
 */
export default {
    "name": "Progressive-Profile",
    // eslint-disable-next-line sort-keys
    "components": {
        "bounce-loader": BounceLoader,
        conditionaluser,
        "fr-center-card": CenterCard
    },
    data () {
        return {
            "apiType": null,
            "displayName": null,
            "loadingColor": styles.baseColor,
            "purpose": null,
            "selfServiceDetails": null,
            "selfServiceType": null,
            "showForm": false
        };
    },
    "methods": {
        apiErrorCallback (error) {
            /* istanbul ignore next */
            this.displayNotification("error", error.response.data.message);
            /* istanbul ignore next */
            this.loadData();
        },
        // eslint-disable-next-line max-statements
        setChildComponent (type, details) {
            this.selfServiceDetails = details;
            this.selfServiceType = type;

            if (isEmpty(details.requirements) && details.tag === "initial") {
                this.advanceStage({
                    "input": {}
                });
            } else if (has(details, "requirements.uiConfig")) {
                this.showForm = true;
                this.displayName = details.requirements.uiConfig.displayName;
                this.purpose = details.requirements.uiConfig.purpose;
                // Can skip the stage by default
                this.selfServiceDetails.canSkip = true;

                /*
                 * If there are any kba questions, terms and conditions,
                 *     or required attributes the stage cannot be skipped
                 */
                if (
                    has(details, "requirements.properties.kba") ||
                        has(details, "requirements.terms") ||
                        // eslint-disable-next-line no-extra-parens
                        (
                            has(details.requirements, "attributes") &&
                            filter(details.requirements.attributes, { "isRequired": true }).length >= 1
                        )
                ) {
                    this.selfServiceDetails.canSkip = false;
                }
            } else if (details.tag === "end" && details.status.success) {
                this.showForm = false;
                /* istanbul ignore next */
                this.setUser();
            }
        },
        setUser () {
            /* istanbul ignore next */
            const loginServiceInstance = this.getRequestService({
                "headers": this.getAnonymousHeaders()
            });
                /* istanbul ignore next */
            loginServiceInstance.post("/authentication?_action=login").then((userDetails) => {
                // Check for progressive profiling.
                this.progressiveProfileCheck(userDetails, () => {
                    /* istanbul ignore next */
                    axios.all([
                        loginServiceInstance.get(`${userDetails.data.authorization.component}/${userDetails.data.authorization.id}`),
                        loginServiceInstance.post("privilege?_action=listPrivileges"),
                        loginServiceInstance.get(`schema/${userDetails.data.authorization.component}`)
                    ]).then(axios.spread((profile, privilege, schema) => {
                        this.$root.userStore.setProfileAction(profile.data);
                        this.$root.userStore.setSchemaAction(schema.data);
                        this.$root.userStore.setAccess(privilege.data);

                        this.completeLogin();
                    })).
                        catch((error) => {
                            /* istanbul ignore next */
                            this.displayNotification("error", error.response.data.message);
                        });
                }, true);
            }).
                catch((error) => {
                    /* istanbul ignore next */
                    this.displayNotification("error", error.response.data.message);
                });
        }
    },
    "mixins": [SelfserviceAPI],
    mounted () {
        /* istanbul ignore next */
        this.apiType = this.$route.params.profileProcess;
        /* istanbul ignore next */
        this.loadData();
    }
};
</script>
