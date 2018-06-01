<template>
        <div>
            <b-img v-if="imageFound" :src="src" :width="width" :height="width" :alt="alt" />
            <span  v-else class="icon-holder p-2 d-flex bg-light border rounded">
                <i :class="['fa fa-lg text-dark mt-auto', fallback]"></i>
            </span>
        </div>
</template>

<script>
    import axios from 'axios';

    export default {
        name: 'Image-Fallback',
        props: ['src', 'width', 'height', 'alt', 'fallback'],
        data () {
            return {
                imageFound: false
            };
        },
        mounted () {
            /* istanbul ignore next */
            axios.get(`/${this.src}`).then(({status}) => {
                this.imageFound = status === 200;
            }).catch((error) => {
                if (error) {
                    this.imageFound = false;
                }
            });
        }
    };
</script>

<style language="scss" scoped>
    .icon-holder {
        min-height: 2.28rem;
        min-width: 2.28rem;
    }
</style>
