<template>
    <div>
        <h3 v-if="inline === false">{{$t("pages.selfservice.registration.consent.title")}}</h3>
        <div class="d-block text-center">
            <p>{{selfServiceDetails.requirements.consent}}</p>
        </div>

        <b-button v-if="inline === false" @click="save" :block="true" variant="primary">
            {{$t("common.form.submit")}}
        </b-button>
    </div>
</template>

<script>
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
            getData: function () {
                return {
                    consentGiven: 'true'
                };
            },

            save: function () {
                this.$emit('saveSelfService', this.getData());
            },

            isValid: function () {
                return Promise.resolve(true);
            }
        }
    };
</script>

<style scoped>

</style>