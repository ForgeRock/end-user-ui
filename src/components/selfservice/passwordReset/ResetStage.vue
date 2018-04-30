<!--
    *******TODO*******
    THIS IS A WORKING 'STUB' WE NEED TO ADD POLICY VALIDATION AND FINISH THIS COMPONENT
 -->
<template>
    <div v-if="selfServiceDetails.tag ==='end'">
        <b-alert show>
            <p>{{$t('pages.selfservice.passwordReset.successMessage')}}</p>
        </b-alert>
    </div>
    <div v-else-if="typeof selfServiceDetails.error !== 'string'">
        <b-form v-if @keyup.enter="save" @submit.prevent>
            <b-form-group>
                <fr-floating-label-input v-model="password" fieldName="password" :label="$t('pages.selfservice.passwordReset.newPassword')" type="password" autofocus="true"></fr-floating-label-input>
            </b-form-group>
            <small class="fr-password-requirements form-text text-muted mt-3">
                <div class="row">
                    <div class="col text-left">
                        <ul>
                            <li>One lower case character</li>
                            <li>One number</li>
                            <li>8 characters minimum</li>
                        </ul>
                    </div>
                </div>
            </small>
            <b-button @click="save" :block="true" variant="primary">
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
    import FloatingLabelInput from '@/components/utils/FloatingLabelInput';

    export default {
        name: 'Reset-Stage',
        components: {
            'fr-floating-label-input': FloatingLabelInput
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
