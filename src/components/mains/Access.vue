<template>
    <b-container fluid>
        <h3>{{resource}} - {{name}}</h3>
    </b-container>
</template>

<script>
    export default {
        name: 'Access',
        data () {
            return {
                name: this.$route.params.resourceName,
                resource: this.$route.params.resourceType
            };
        }
    };
</script>

<style lang="scss"></style>
