<template>
    <fr-list-group :title="$t('common.user.profile.preferencesTitle')" :subtitle="$t('common.user.profile.preferencesSubtitle')">
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
                        @change="savePreferences"/>
                </div>
            </div>
            
        </fr-list-item>
    </fr-list-group>
</template>

<script>
    import _ from 'lodash';
    import ListGroup from '@/components/utils/ListGroup';
    import ListItem from '@/components/utils/ListItem';

    export default {
        name: 'Preferences',
        components: {
            'fr-list-group': ListGroup,
            'fr-list-item': ListItem
        },
        data: function () {
            return {
                preferences: {}
            };
        },
        mounted: function () {
            this.loadData();
        },
        methods: {
            loadData: function () {
                let keys = _.keys(this.$root.userStore.state.profile.preferences),
                    preferences = _.cloneDeep(this.$root.userStore.state.schema.properties.preferences.properties);

                _.each(keys, (key) => {
                    preferences[key].value = this.$root.userStore.state.profile.preferences[key];
                    delete preferences[key].type;
                });

                this.preferences = preferences;
            },
            savePreferences: function (event) {
                /* istanbul ignore next */
                let userId = this.$root.userStore.state.userId,
                    selfServiceInstance = this.getRequestService({
                        headers: {
                            'X-OpenIDM-NoSession': true,
                            'X-OpenIDM-Password': 'anonymous',
                            'X-OpenIDM-Username': 'anonymous'
                        }
                    }),
                    toggleState = event.value,
                    preferenceName = event.srcEvent.srcElement.parentElement.id,
                    patch = [{operation: 'replace', field: '/preferences/' + preferenceName, value: toggleState}];

                /* istanbul ignore next */
                selfServiceInstance.patch(`managed/user/${userId}`, patch).then((response) => {
                    this.$root.userStore.setProfileAction(response.data);

                    this.$notify({
                        group: 'IDMMessages',
                        type: 'success',
                        text: this.$t('common.user.profile.updateSuccess')
                    });
                })
                .catch((error) => {
                    /* istanbul ignore next */
                    this.$notify({
                        group: 'IDMMessages',
                        type: 'error',
                        text: error.response.data.message
                    });
                });
            }
        }
    };
</script>

<style scoped>
</style>