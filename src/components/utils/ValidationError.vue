<template>
    <div v-show="validatorErrors.has(fieldName)" class="fr-validation-requirements text-left">
        <span class="text-danger">{{validatorErrors.first(fieldName)}}</span>
    </div>
</template>

<script>
/**
 * @description Component for displaying error message for form fields
 *
 **/
export default {
    name: 'Validation-Error',
    props: ['validatorErrors', 'fieldName']
};
</script>

<style lang="scss" scoped></style>
