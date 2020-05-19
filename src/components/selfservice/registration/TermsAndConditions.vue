<template>
    <div v-if="inline">
        <small class="form-text text-muted">
            {{ $t("pages.selfservice.registration.termsAndConditions.singlePage") }} <a v-b-modal="'termsModal'" href="#" @click.prevent="">{{ $t("pages.selfservice.registration.termsAndConditions.title") }}</a>.
        </small>

        <b-modal id="termsModal" hide-footer :title="$t('pages.selfservice.registration.termsAndConditions.title')">
            <div class="d-block text-center">
                <p v-html="selfServiceDetails.requirements.terms">{{ selfServiceDetails.requirements.terms }}</p>
            </div>
        </b-modal>
    </div>
    <div v-else>
        <h3>{{ $t("pages.selfservice.registration.termsAndConditions.title") }}</h3>
        <div class="d-block text-center">
            <p v-html="selfServiceDetails.requirements.terms">{{ selfServiceDetails.requirements.terms }}</p>
        </div>

        <b-button v-if="inline === false" :block="true" size="lg" variant="primary" @click="save">
            {{ $t("common.form.agree") }}
        </b-button>
    </div>
</template>

<script>

/**
 * @description Selfservice stage for terms and conditions depending on all in one displays as a dialog or inline text depending at allinone
 *
 */
export default {
    "name": "Terms-And-Conditions",
    // eslint-disable-next-line sort-keys
    "methods": {
        getData () {
            return {
                "accept": "true"
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
