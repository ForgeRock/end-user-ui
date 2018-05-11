<template>
    <div v-if="selfServiceDetails.tag ==='end'">
        <b-alert show>
            <p>{{$t('pages.selfservice.passwordReset.successMessage')}}</p>
        </b-alert>
    </div>
    <div v-else-if="typeof selfServiceDetails.error !== 'string'">
        <b-form v-if @keyup.enter="save" @submit.prevent>
                <fr-policy-password-input policyApi="reset" v-model="password" name="password" :label="$t('pages.selfservice.passwordReset.newPassword')" ></fr-policy-password-input>
            <b-button @click="save" :block="true" size="lg" variant="primary">
                {{$t("pages.selfservice.passwordReset.changePassword")}}
            </b-button>
        </b-form>
    </div>
    <div v-else>
        <b-alert variant="danger" show>
            <b>{{$t('pages.selfservice.passwordReset.errorMessage')}}</b>
            <p>{{selfServiceDetails.error}}</p>
        </b-alert>
        <div class="mt-2">
            <b-link href="#/passwordReset" @click="$router.go($router.currentRoute)">
                {{$t("pages.selfservice.passwordReset.tryAgain")}}
            </b-link>
        </div>
    </div>
</template>

<script>
    import PolicyPasswordInput from '@/components/utils/PolicyPasswordInput';

    export default {
        name: 'Reset-Stage',
        components: {
            'fr-policy-password-input': PolicyPasswordInput
        },
        props: {
            selfServiceDetails: { required: true }
        },
        data () {
            return {
                password: ''
            };
        },
        methods: {
            getData () {
                return {
                    password: this.password
                };
            },
            save () {
                this.$emit('advanceStage', this.getData());
            }
        }
    };
</script>
