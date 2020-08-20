<template>
    <fr-list-group :title="$t('pages.profile.preferences.title')" :subtitle="$t('pages.profile.preferences.subtitle')">
        <fr-list-item v-for="(obj, preference) in preferences" :key="preference"
            :collapsible="false"
            :panelShown="false">

            <div slot="list-item-header" class="d-inline-flex w-100">
                <h6 class="mt-3">{{obj.description}}</h6>

                <div class="ml-auto">
                    <toggle-button class="mt-2 p-0 fr-toggle-primary"
                        :id="preference"
                        :height="28"
                        :width="56"
                        :sync="true"
                        :cssColors="true"
                        :value="obj.value"
                        @change="savePreferences(preference, $event.value)"/>
                </div>
            </div>

        </fr-list-item>
    </fr-list-group>
</template>

<script>
import _ from 'lodash';
import ListGroup from '@/components/utils/ListGroup';
import ListItem from '@/components/utils/ListItem';

/**
 * @description Displays available user preferences, these are typically true/false values associated with a managed resource (e.g. Do you want to recieve marketing emails?).
 *
 */
export default {
    name: 'Preferences',
    components: {
        'fr-list-group': ListGroup,
        'fr-list-item': ListItem
    },
    data () {
        return {
            preferences: {}
        };
    },
    mounted () {
        this.loadData();
    },
    methods: {
        loadData () {
            let keys = _.keys(this.$root.userStore.state.profile.preferences),
                preferences = _.cloneDeep(this.$root.userStore.state.schema.properties.preferences.properties);

            _.each(keys, (key) => {
                preferences[key].value = this.$root.userStore.state.profile.preferences[key];
                delete preferences[key].type;
            });

            this.preferences = preferences;
        },
        generatePatch (preference, value) {
            return [{ operation: 'replace', field: '/preferences/' + preference, value }];
        },
        savePreferences (preference, value) {
            this.$emit('updateProfile', this.generatePatch(preference, value));
        }
    }
};
</script>

<style scoped>
</style>
