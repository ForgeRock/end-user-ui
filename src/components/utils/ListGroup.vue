<template>
    <b-card no-body class="mb-3">
        <slot name="list-group-header">
            <b-card-body class="py-4">
                <h5 :class="[{ 'mb-4': subtitle, 'mb-0': !subtitle}, 'card-title']">{{title}}</h5>
                <h6 v-if="subtitle" class="card-subtitle mb-0 text-muted">{{subtitle}}</h6>
            </b-card-body>
        </slot>
        <b-list-group flush>
            <slot></slot>
        </b-list-group>
    </b-card>
</template>

<script>
/**
 * @description Container for holding ListItem.vue, together both components can be used to display a list of items with varying degrees of customization
 *
 **/
export default {
    name: 'List-Group',
    props: {
        'title': {
            type: String
        },
        'subtitle': {
            type: String
        }
    },
    data () {
        return {};
    }
};
</script>

<style lang="scss" scoped>
    .card {
        text-align: left;
    }
</style>
