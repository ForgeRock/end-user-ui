<template>
    <div class="row">
            <div class="col pr-0"><hr></div>
            <div class="col-auto pt-1" v-html="insert">{{ insert }}</div>
            <div class="col pl-0"><hr></div>
        </div>
</template>

<script>
/**
 * @description Component for making a horizontal rule line with text in the middle
 *
 **/
export default {
    name: 'Horizontal-Rule',
    props: ['insert']
};
</script>

<style lang="scss" scoped>
</style>
