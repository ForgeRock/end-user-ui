<template>
    <div v-if="inline">
        <p>{{$t("pages.selfservice.registration.termsAndConditions.singlePage")}} <a href="#" @click.prevent="" v-b-modal="'termsModal'">{{$t("pages.selfservice.registration.termsAndConditions.title")}}</a>.</p>

        <b-modal id="termsModal" hide-footer :title="$t('pages.selfservice.registration.termsAndConditions.title')">
            <div class="d-block text-center">
                <p>{{selfServiceDetails.requirements.terms}}</p>
            </div>
        </b-modal>
    </div>
    <div v-else>
        <h3>{{$t("pages.selfservice.registration.termsAndConditions.title")}}</h3>
        <div class="d-block text-center">
            <p>{{selfServiceDetails.requirements.terms}}</p>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Terms-And-Conditions',
        props: {
            inline: { required: false },
            selfServiceDetails: { required: true }
        },
        methods: {
            getData: function () {
                return {
                    accept: 'true'
                };
            },
            isValid: function () {
                return Promise.resolve(true);
            }
        }
    };
</script>

<style scoped>

</style>