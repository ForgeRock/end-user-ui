<template>
    <div>
        <h3 v-if="inline === false">{{$t("pages.selfservice.registration.consent.title")}}</h3>
        <div class="d-block text-center">
            <p>{{selfServiceDetails.requirements.consent}}</p>
        </div>

        <b-button v-if="inline === false" @click="save" :block="true" size="lg" variant="primary">
            {{$t("common.form.agree")}}
        </b-button>
    </div>
</template>

<script>
/**
 * @description Selfservice stage for consent depending on all in one displays as a dialog or a basic page text display
 *
 **/
export default {
    name: 'Consent',
    props: {
        selfServiceDetails: { required: true },
        inline: {
            required: false,
            default: false
        }
    },
    methods: {
        getData () {
            return {
                consentGiven: 'true'
            };
        },

        save () {
            this.$emit('advanceStage', this.getData());
        },

        isValid () {
            return Promise.resolve(true);
        }
    }
};
</script>

<style scoped></style>
