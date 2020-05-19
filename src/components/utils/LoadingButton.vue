<template>
    <button :class="['btn btn-primary d-flex align-items-center', {'disabled': loading}]" type="button" @click="$emit('click')">
        <span :class="[{'align-self-start': !large, 'm-auto': large}]">
            {{ label }}
        </span>
        <span :class="['fr-grow', {'fr-grow-in': loading}]">
            <transition name="fr-fade">
                <clip-loader v-if="loading" :color="'white'" :size="'1rem'" class="position-relative fr-clip-loader ml-3" />
            </transition>
        </span>
    </button>
</template>
<script>
// eslint-disable-next-line import/extensions
import { ClipLoader } from "vue-spinner/dist/vue-spinner.min.js";

/**
 * @description Button with built in loading spinner that can be used to show users something is loading
 *
 */
export default {
    "name": "LoadingButton",
    // eslint-disable-next-line sort-keys
    "components": { ClipLoader },
    "props": {
        "label": String,
        "large": {
            "default": false,
            "type": Boolean
        },
        "loading": {
            "default": false,
            "type": Boolean
        }
    }
};
</script>
<style lang="scss" scoped>
    .fr-grow {
        width: 0;
        transition: all .25s ease;
    }
    .fr-grow-in {
        width: 3rem;
    }

    .fr-fade-enter-active {
        transition: all .125s ease;
    }
    .fr-fade-leave {
        transition: all .125s ease;
    }
    .fr-fade-enter, .fr-fade-leave-to {
        opacity: 0;
    }
    .fr-fade-enter-to {
        opacity: 1
    }
    .fr-clip-loader {
        top: 0.15rem;
    }
</style>
