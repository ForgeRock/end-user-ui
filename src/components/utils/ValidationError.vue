<template>
    <div v-show="validatorErrors.has(fieldName)" class="fr-validation-requirements text-left">
        <span class="text-danger">{{validatorErrors.first(fieldName)}}</span>
    </div>
</template>

<script>
    export default {
        name: 'floating-label-input',
        props: ['validatorErrors', 'fieldName']
    };
</script>

<style lang="scss" scoped>
    .fr-validation-requirements {}
</style>