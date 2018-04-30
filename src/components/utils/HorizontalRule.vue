<template>
    <div class="row">
            <div class="col pr-0"><hr></div>
            <div class="col-auto pt-1" v-html="insert">{{ insert }}</div>
            <div class="col pl-0"><hr></div>
        </div>
</template>

<script>
    export default {
        name: 'Horizontal-Rule',
        props: ['insert']
    };
</script>

<style lang="scss" scoped>
</style>