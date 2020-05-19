<template>
    <fr-list-group :title="$t('pages.profile.preferences.title')" :subtitle="$t('pages.profile.preferences.subtitle')">
        <fr-list-item
            v-for="(obj, preference) in preferences"
            :key="preference"
            :collapsible="false"
            :panel-shown="false"
        >
            <div slot="list-item-header" class="d-inline-flex w-100">
                <h6 class="mt-3">{{ obj.description }}</h6>

                <div class="ml-auto">
                    <toggle-button
                        :id="preference"
                        class="mt-2 p-0 fr-toggle-primary"
                        :height="28"
                        :width="56"
                        :sync="true"
                        :css-colors="true"
                        :value="obj.value"
                        @change="savePreferences(preference, $event.value)"
                    />
                </div>
            </div>
        </fr-list-item>
    </fr-list-group>
</template>

<script>
import { cloneDeep, each, keys } from "lodash";
import ListGroup from "../utils/ListGroup";
import ListItem from "../utils/ListItem";

/**
 * @description Displays available user preferences, these are typically true/false values associated with a managed resource (e.g. Do you want to recieve marketing emails?).
 *
 */
export default {
    "name": "Preferences",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-list-group": ListGroup,
        "fr-list-item": ListItem
    },
    data () {
        return {
            "preferences": {}
        };
    },
    "methods": {
        generatePatch (preference, value) {
            return [{ "field": `/preferences/${preference}`, "operation": "replace", value }];
        },
        loadData () {
            const preferences = cloneDeep(this.$root.userStore.state.schema.properties.preferences.properties);

            each(keys(this.$root.userStore.state.profile.preferences), (key) => {
                preferences[key].value = this.$root.userStore.state.profile.preferences[key];
                delete preferences[key].type;
            });

            this.preferences = preferences;
        },
        savePreferences (preference, value) {
            this.$emit("updateProfile", this.generatePatch(preference, value));
        }
    },
    mounted () {
        this.loadData();
    }
};
</script>

<style scoped>
</style>
