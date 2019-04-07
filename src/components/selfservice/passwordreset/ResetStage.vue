<template>
    <div v-if="selfServiceDetails.tag ==='end'">
        <b-alert show>
            <p>{{$t('pages.selfservice.passwordReset.successMessage')}}</p>
        </b-alert>
    </div>
    <div v-else-if="typeof selfServiceDetails.error !== 'string'">
        <b-form v-if @keyup.enter="save" @submit.prevent>
                <fr-policy-password-input policyApi="selfservice/reset" v-model="password" name="password" :label="$t('pages.selfservice.passwordReset.newPassword')" ></fr-policy-password-input>
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
            <router-link action="" :to="{ path: '/passwordreset/'}">{{$t("pages.selfservice.passwordReset.tryAgain")}}</router-link>
        </div>
    </div>
</template>

<script>
    import PolicyPasswordInput from '@/components/utils/PolicyPasswordInput';

    /**
     * @description Selfservice stage for password reset, handles the final result of password reset, either displaying an error or that the reset has been complete
     *
     **/
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
