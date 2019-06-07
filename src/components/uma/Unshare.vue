<template>
    <b-modal id="unshareModal" class="" ref="fsModal" cancel-variant="outline-secondary" @keydown.enter.native.prevent="unshare">
        <div slot="modal-header" class="d-flex w-100 h-100">
            <h6 class="my-0">{{ $t('pages.uma.resources.unshareResource', {resourceName: resourceName}) }}</h6>
            <button type="button" aria-label="Close" class="close" @click="hideModal"><i class="fa fa-times"></i></button>
        </div>
        {{$t('pages.uma.resources.warningMessage')}}
        <div slot="modal-footer">
            <div class="float-right">
                <b-btn variant="outline-secondary mr-2" @click="hideModal">{{$t('pages.uma.resources.cancel')}}</b-btn>
                <b-btn type="button" variant="danger" @click="unshare">{{$t('pages.uma.resources.unshare')}}</b-btn>
            </div>
        </div>
    </b-modal>
</template>

<script>
/**
 * @description Dialog for warning a user and confirming they want to stop sharing a resource
 *
 **/
export default {
    name: 'Unshare',
    components: {},
    data () {
        return {};
    },
    props: ['resourceId', 'resourceName'],
    methods: {
        hideModal () {
            this.$refs.fsModal.hide();
        },
        unshare () {
            this.$emit('unshareResource', this.resourceId);
            this.hideModal();
        }
    }
};
</script>

<style lang="scss">
</style>
