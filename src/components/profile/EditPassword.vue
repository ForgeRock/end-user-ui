<template>
    <fr-list-item :collapsible="true" :panelShown="false"  @show="showCancelButton = true" @hide="showCancelButton = true; clearComponent()">>
        <div slot="list-item-header" class="d-inline-flex w-100 media">
            <div class="media-body align-self-center">
                <h6 class="mt-2">{{$t('pages.profile.accountSecurity.password')}}</h6>
            </div>
            <div class="d-flex ml-3 align-self-center">
                <div v-show="showCancelButton" class="btn btn-sm btn-link float-right btn-cancel p-0" ref="cancel">{{$t('common.form.cancel')}}</div>
            </div>
        </div>

        <div slot="list-item-collapse-body" class="d-inline-flex w-100">
            <b-form class="w-100">
                <b-row>
                    <b-col sm="8">
                        <b-form-group>
                            <fr-floating-label-input
                                name="currentPassword"
                                fieldName="currentPassword"
                                type="password"
                                v-model="currentPassword"
                                :label="$t('pages.profile.accountSecurity.currentPassword')"
                                :reveal="true"
                                :showErrorState="false" />
                        </b-form-group>

                        <fr-password-policy-input :policyApi="`${this.$root.userStore.state.managedResource}/${userId}`" v-model="newPassword" />

                        <fr-loading-button type="button" variant="primary" class="ld-ext-right mb-3"
                            :label="$t('pages.profile.accountSecurity.savePassword')"
                            :loading="loading"
                            @click="onSavePassword"></fr-loading-button>

                        <div v-if="this.$root.applicationStore.state.passwordReset" class="text-nowrap pb-2">{{$t('pages.profile.accountSecurity.rememberPassword')}} <router-link to="PasswordReset">{{$t('pages.profile.accountSecurity.resetPassword')}}</router-link></div>
                    </b-col>
                </b-row>
            </b-form>
        </div>
    </fr-list-item>
</template>
<script>
import ListItem from '@/components/utils/ListItem';
import LoadingButton from '@/components/utils/LoadingButton';
import PolicyPasswordInput from '@/components/utils/PolicyPasswordInput';
import FloatingLabelInput from '@/components/utils/FloatingLabelInput';
import { noop } from 'lodash';

/**
 * @description Allows a user to change their password, makes use of policy password component, similar to registration it will only allow a user to change password
 * as long as it passes policy requirements (policy.json).
 *
 */
export default {
    name: 'Edit-Password',
    components: {
        'fr-list-item': ListItem,
        'fr-floating-label-input': FloatingLabelInput,
        'fr-loading-button': LoadingButton,
        'fr-password-policy-input': PolicyPasswordInput
    },
    data () {
        return {
            currentPassword: '',
            newPassword: '',
            loading: false,
            showNew: true,
            showCurrent: true,
            inputCurrent: 'password',
            inputNew: 'password',
            userId: this.$root.userStore.getUserState().userId,
            showCancelButton: false
        };
    },
    methods: {
        clearComponent () {
            this.currentPassword = '';
            this.newPassword = '';
            this.showCancelButton = false;
        },
        resetComponent () {
            this.loading = false;
            this.currentPassword = '';
            this.newPassword = '';
            this.$refs.cancel.click();
        },
        onSavePassword () {
            const headers = {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-OpenIDM-Reauth-Password': this.encodeRFC5987IfNecessary(this.currentPassword)
                },
                payload = [{ operation: 'add', field: '/password', value: this.newPassword }],
                onSuccess = this.resetComponent.bind(this);

            this.$emit('updateProfile', payload, { headers, onSuccess, noop });
        },
        revealNew () {
            if (this.inputNew === 'password') {
                this.inputNew = 'text';
                this.showNew = false;
            } else {
                this.inputNew = 'password';
                this.showNew = true;
            }
        },
        revealCurrent () {
            if (this.inputCurrent === 'password') {
                this.inputCurrent = 'text';
                this.showCurrent = false;
            } else {
                this.inputCurrent = 'password';
                this.showCurrent = true;
            }
        }
    }
};
</script>
