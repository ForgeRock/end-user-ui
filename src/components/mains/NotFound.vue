<template>
    <b-container fluid>
        <div class="fr-header-jumbotron jumbotron">
            <h1>{{ $t("common.errors.notFound") }}</h1>
            <p class="text-muted text-centered">{{ $t("common.errors.notFoundAdditional") }}</p>
        </div>
    </b-container>
</template>

<script>
    export default {
        name: 'NotFound'
    };
</script>
