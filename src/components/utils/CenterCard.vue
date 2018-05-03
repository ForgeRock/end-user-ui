<!--AVAILABLE SLOTS: center-card-header, center-card-body, center-card-footer-->
<template>
    <b-container fluid class="h-100 px-0">
        <div class="h-100 d-flex">
            <div class="m-auto fr-center-card">

                <b-card no-body
                        class="border-xs-0 border-sm"
                        header-tag="header"
                        footer-tag="footer">

                    <b-card-header>
                        <b-img v-if="showLogo" class="fr-logo mb-3 mt-2" src="static/image/vertical-logo.svg" fluid :alt="$t('common.form.logo')" />
                        <slot name="center-card-header"></slot>
                    </b-card-header>

                    <slot name="center-card-body"></slot>

                    <slot name="center-card-footer"></slot>
                </b-card>
            </div>
        </div>
    </b-container>
</template>

<script>
    export default {
        name: 'Center-Card',
        props: {
            'showLogo': {
                type: Boolean,
                default: false
            }
        }
    };
</script>

<style lang="scss" scoped>
    // Selfservice form and card
    .fr-center-card {
        width: 100%;
        margin: 0 auto;
        text-align: center;
        @include media-breakpoint-between(sm, xl) {
            max-width: 420px;
            padding: 40px 0;
        }

        .card {
            border: none;
            @include media-breakpoint-between(sm, xl) {
                margin: 0;
                border-radius: $border-radius;
                border: $border-width solid $border-color;
            }
        }

        .card-header {
            background-color: transparent;
            border: none;
            padding: 40px 50px 0;
        }

        .card-body {
            padding: 20px 40px 40px;
            @include media-breakpoint-between(sm, xl) {
                padding: 20px 40px 40px;
            }
        }

        .card-footer {
            background-color: $white;
            padding: 20px 50px;
        }

    }
</style>
