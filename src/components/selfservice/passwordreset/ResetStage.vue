<template>
    <div v-if="selfServiceDetails.tag ==='end'">
        <b-alert show>
            <p>{{$t('pages.selfservice.passwordReset.successMessage')}}</p>
        </b-alert>
    </div>
    <div v-else-if="typeof selfServiceDetails.error !== 'string'">
        <b-form @keyup.enter="save" @submit.prevent>
                <fr-policy-password-input :defaultPolicyFailures="defaultPolicyFailures" policyApi="selfservice/reset" v-model="password" name="password" :label="$t('pages.selfservice.passwordReset.newPassword')" ></fr-policy-password-input>
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
            <a href="#/passwordreset" v-on:click="reloadPage">{{$t("pages.selfservice.passwordReset.tryAgain")}}</a>
        </div>
    </div>
</template>

<script>
import { has, find, map } from 'lodash';
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
            password: '',
            defaultPolicyFailures: null
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
        },
        reloadPage (event) {
            event.preventDefault();
            let hash = window.location.hash;

            // remove any `code` after last foward slash in url
            window.location.hash = hash.substr(0, hash.lastIndexOf('/') + 1);
            window.location.reload();
        }
    },
    watch: {
        selfServiceDetails: {
            handler (val) {
                /*
                    If there is a change to selfServiceDetails it's probably because of a
                    policy failure on password that could not be handled on the fly with
                    "?_action=validateObject". Look for those failures here and send them to the
                    PolicyPasswordInput via it's defaultPolicyFailures property.
                */
                if (has(val, 'requirements.error.detail.failedPolicyRequirements')) {
                    let failedPolicy = find(val.requirements.error.detail.failedPolicyRequirements, { property: 'password' });

                    if (failedPolicy && failedPolicy.policyRequirements) {
                        this.defaultPolicyFailures = map(failedPolicy.policyRequirements, 'policyRequirement');
                    }
                }
            },
            deep: true
        }
    }
};
</script>
