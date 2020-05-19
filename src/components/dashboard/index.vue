<template>
    <b-container fluid>
        <b-row v-if="widgets.length">
            <div v-for="(widget, index) in widgets" :key="widget.type + index" :class="{'col-sm-4': widget.size === 'small', 'col-sm-6': widget.size === 'medium', 'col-sm-12': widget.size === 'large', 'mt-4': true}">
                <component :is="widget.type" :user-details="userDetails" :details="widget.details" />
            </div>
        </b-row>
        <b-jumbotron v-else class="mt-4 text-center">
            <div class="d-flex justify-content-center mt-3">
                <i class="fa fa-binoculars align-self-center flex-fow-1 mr-4 mb-3" style="font-size:52px;" />
                <div class="flex-fow-1">
                    <h2>{{ $t('pages.dashboard.noWidget') }}</h2>
                    <p v-html="$t('pages.dashboard.noWidgetSubText')" />
                </div>
            </div>
        </b-jumbotron>
    </b-container>
</template>

<script>
import Welcome from "./widgets/WelcomeWidget";
import Workflow from "./widgets/WorkflowControlWidget";

/**
 * @description Controlling component for the dashboard, loads widgets set and configured in the ui-dashboard config file.
 *
 * @fires GET config/ui/dashboard - Read of the config file ui-dashboard.json
 */
export default {
    "name": "Dashboard",
    // eslint-disable-next-line sort-keys
    "components": {
        Welcome,
        Workflow
    },
    data () {
        return {
            "userDetails": this.$root.userStore.getUserState(),
            "widgets": []
        };
    },
    "methods": {
        loadData () {
            /* istanbul ignore next */
            this.getRequestService().get("config/ui/dashboard").
                then(({ data }) => {
                    this.widgets = data.dashboard.widgets;

                    if (this.$root.applicationStore.state.workflow) {
                        this.widgets.push({
                            "size": "large",
                            "type": "Workflow"
                        });
                    }
                }).
                catch((error) => {
                    this.displayNotification("error", error.response.data.message);
                });
        }
    },
    mounted () {
        this.loadData();
    }
};
</script>
