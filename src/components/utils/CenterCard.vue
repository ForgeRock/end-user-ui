<!--AVAILABLE SLOTS: center-card-header, center-card-body, center-card-footer-->
<template>
    <b-container fluid class="px-0 h-100 d-flex">
        <div class="fr-m-auto fr-center-card align-self-center">
            <b-card no-body
                    class="border-xs-0 border-sm d-flex fr-stretch-card"
                    header-tag="header"
                    footer-tag="footer">

                <b-card-header class="d-flex align-items-center flex-fill">
                    <!--For dark theme use vertical-logo-white.svg version of logo-->

                    <div class="d-flex flex-fill flex-column justify-content-center">
                        <b-img v-if="showLogo" class="fr-logo mb-3 mt-2" :src="require('@/assets/images/vertical-logo.svg')" fluid :alt="$t('common.form.logo')" />
                        <slot name="center-card-header"></slot>
                    </div>
                </b-card-header>

                <slot name="center-card-body"></slot>
                <slot name="center-card-footer"></slot>
            </b-card>
        </div>

    </b-container>
</template>
<script>
/**
 * @description Card container that will stay horizontally and vertically center on the screen (example can be found on the default login page)
 *
 **/
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
        text-align: center;

        @include media-breakpoint-between(sm, xl) {
            max-width: 420px;
            padding: 40px 0;
            margin: 0 auto;
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
            border: none;
            padding: 40px 50px 0;

            .justify-content-center {
                flex-direction: column;
                .fr-logo {
                    align-self: center;
                }
            }
        }

        .card-body {
            padding: 20px 40px 40px;
            @include media-breakpoint-between(sm, xl) {
                padding: 20px 40px 40px;
            }
        }

        .card-footer {
            padding: 20px 50px;
        }

        .fr-footer-bottom {
            @media(max-width:575px) {
                position: fixed;
                bottom: 0;
                width: 100%;
            }
        }
    }

    .fr-m-auto {
        @include media-breakpoint-between(sm, xl) {
            margin: auto;
        }

        @media(max-width:575px) {
            height: 100%;
            margin: 0;
        }

        .fr-stretch-card {
            @media(max-width:575px) {
                height: 100%;
            }
        }
    }
</style>
