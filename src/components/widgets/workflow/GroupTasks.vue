<template>
    <div>
        <fr-list-group :title="this.$t('pages.workflow.unassignedTasks')">
            <template v-if="tasks.length > 0">
                <fr-list-item :collapsible="true">
                    <div slot="list-item-header" class="d-inline-flex w-100 media">
                        <div class="media-body align-self-center">
                            <h6>Tasks</h6>
                        </div>
                        <div class="d-flex ml-3 align-self-center">
                            <div class="btn btn-sm btn-link float-right btn-cancel" ref="cancel">{{$t('common.form.cancel')}}</div>
                            <div class="btn btn-sm btn-link float-right btn-edit">{{$t('common.form.edit')}}</div>
                        </div>
                    </div>

                    <div slot="list-item-collapse-body" class="d-inline-flex w-100">
                        Load Task
                    </div>
                </fr-list-item>
            </template>
            <fr-list-item v-else>
                <div slot="list-item-header" class="text-muted text-center w-100">
                    {{$t('pages.workflow.noGroupTasks')}}
                </div>
            </fr-list-item>
        </fr-list-group>
    </div>
</template>

<script>
    import ListGroup from '@/components/utils/ListGroup';
    import ListItem from '@/components/utils/ListItem';

    export default {
        name: 'Group-Tasks',
        props: {
            'tasks': {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        mounted () {
            // TODO Convert tasks to load properly (currently key assigned in object)
        },
        components: {
            'fr-list-group': ListGroup,
            'fr-list-item': ListItem
        },
        methods: {}
    };
</script>

<style lang="scss" scoped></style>