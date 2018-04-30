<template>
    <b-card no-body>
        <b-card-body class="py-4">
            <h5 class="card-title mb-4">{{title}}</h5>
            <h6 class="card-subtitle mb-0 text-muted">{{subtitle}}</h6>
        </b-card-body>
        <b-list-group flush>
            <slot></slot>
        </b-list-group>
    </b-card>
</template>

<script>
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
