<template>
    <b-container id="notFoundContainer" class="h-100 d-flex" fluid>
        <div style="width: 350px;" class="m-auto align-self-center text-center">
            <b-img src="static/images/ghost.svg" width="112" height="112" alt="img" class="fr-ghost mb-2" />
            <div class="fr-code">404</div>
            <p class="text-centered">{{$t("pages.notFound.couldNotFind")}}</p>

            <router-link to="/">
                <b-button style="width:250px;" variant="primary" class="mt-2 mb-2">
                    {{$t("pages.notFound.returnToDashboard")}}
                </b-button>
            </router-link>

            <b-img src="static/images/ghost-shadow.svg" width="112" height="112" alt="img" class="fr-shadow"/>
        </div>
    </b-container>
</template>

<script>
    export default {
        name: 'NotFound'
    };
</script>

<style lang="scss">
    @keyframes nudge {
        0%, 100% {
            transform: translate(0, 0);
        }

        25% {
            transform: translate(15px, 5px);
        }

        50% {
            transform: translate(20px, 0);
        }

        80% {
            transform: translate(10px, 5px);
        }

        90% {
            transform: translate(-10px, 0);
        }
    }

    #notFoundContainer {
        .fr-code {
            font-size: 52px;
            font-weight: 300;
        }

        .fr-ghost {
            animation: nudge 5s linear infinite alternate;
        }

        .fr-shadow {
            animation: nudge 5s linear infinite alternate;
        }
    }
</style>
