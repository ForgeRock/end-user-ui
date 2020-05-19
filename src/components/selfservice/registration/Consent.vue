<template>
    <div>
        <h3 v-if="inline === false">{{ $t("pages.selfservice.registration.consent.title") }}</h3>
        <div class="d-block text-center">
            <p>{{ selfServiceDetails.requirements.consent }}</p>
        </div>

        <b-button v-if="inline === false" :block="true" size="lg" variant="primary" @click="save">
            {{ $t("common.form.agree") }}
        </b-button>
    </div>
</template>

<script>

/**
 * @description Selfservice stage for consent depending on all in one displays as a dialog or a basic page text display
 *
 */
export default {
    "name": "Consent",
    // eslint-disable-next-line sort-keys
    "methods": {
        getData () {
            return {
                "consentGiven": "true"
            };
        },
        isValid () {
            return Promise.resolve(true);
        },
        save () {
            this.$emit("advanceStage", this.getData());
        }
    },
    "props": {
        "inline": {
            "default": false,
            "required": false
        },
        "selfServiceDetails": { "required": true }
    }
};
</script>

<style scoped></style>
