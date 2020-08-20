<template>
    <b-container id="notFoundContainer" class="h-100 d-flex" fluid>
        <div style="width: 350px;" class="m-auto align-self-center text-center">
            <div class="fr-speech-bubble">
                <p><strong class="text-muted">{{ghostMessage}}</strong></p>
                <div class="fr-speech-arrow"></div>
            </div>
            <b-img @click="ghostMessage === '404' ? ghostMessage = 'Boo' : ghostMessage = '...'" :src="require('@/assets/images/ghost.svg')" width="112" height="112" alt="img" class="fr-ghost mb-2" />
            <p class="text-centered">{{$t("pages.notFound.couldNotFind")}}</p>

            <router-link to="/">
                <b-button style="width:250px;" variant="primary" class="mt-2 mb-2">
                    {{$t("pages.notFound.returnToDashboard")}}
                </b-button>
            </router-link>

            <b-img @click="ghostMessage = '404'" :src="require('@/assets/images/ghost-shadow.svg')" width="112" height="112" alt="img" class="fr-shadow"/>
        </div>
    </b-container>
</template>

<script>
/**
 * @description The default 404 page when Vue router is unable to locate a route.
 */
export default {
    name: 'NotFound',
    data () {
        return {
            ghostMessage: '404'
        };
    }
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
        .fr-ghost, .fr-shadow  {
            animation: nudge 5s linear infinite alternate;
            cursor: pointer;
        }

        .fr-speech-bubble {
            animation: nudge 5s linear infinite alternate;
            font-size: 20px;
            font-weight: 300;
            background: #fff;
            border: 1px solid #a7a7a7;
            -webkit-border-radius: 4px;
            border-radius: 4px;
            -webkit-box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
            box-shadow: 4px 4px 0 rgba(0, 0, 0, 0.2);
            line-height: 1.3;
            margin: 0 auto 15px;
            max-width: 110px;
            padding: 15px;
            position: relative;
            right:70px;

            p {
                margin-bottom: 10px;

                &:last-of-type {
                    margin-bottom: 0;
                }
            }

            .fr-speech-arrow {
                border-left: 21px solid transparent;
                border-top: 20px solid rgba(0, 0, 0, 0.2);
                bottom: -25px;
                position: absolute;
                right: 15px;

                &::before {
                    border-left: 23px solid transparent;
                    border-top: 23px solid #fff;
                    bottom: 2px;
                    content: "";
                    position: absolute;
                    right: 5px;
                }

                &::after {
                    border-left: 21px solid transparent;
                    border-top: 21px solid #fff;
                    bottom: 4px;
                    content: "";
                    position: absolute;
                    right: 6px;
                }
            }
        }
    }
</style>
