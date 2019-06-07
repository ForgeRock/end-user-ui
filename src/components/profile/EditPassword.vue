<template>
    <fr-list-item :collapsible="true" :panelShown="false">
        <div slot="list-item-header" class="d-inline-flex w-100 media">
            <div class="media-body align-self-center">
                <h6>{{$t('pages.profile.accountSecurity.password')}}</h6>
            </div>
            <div class="d-flex ml-3 align-self-center">
                <div class="btn btn-sm btn-link float-right btn-cancel" @click="clearComponent()" ref="cancel">{{$t('common.form.cancel')}}</div>
                <div class="btn btn-sm btn-link float-right btn-edit">{{$t('common.form.reset')}}</div>
            </div>
        </div>

        <div slot="list-item-collapse-body" class="d-inline-flex w-100">
            <b-form class="w-100">
                <b-row>
                    <b-col sm="8">
                        <b-form-group>
                            <label for="currentPassword">{{$t('pages.profile.accountSecurity.currentPassword')}}</label>
                            <div class="form-label-password form-label-group mb-0">
                                <b-form-input id="currentPassword" name="currentPassword" data-vv-validate-on="submit" :data-vv-as="$t('pages.profile.accountSecurity.currentPassword')" :class="[{'is-invalid': errors.has('currentPassword')}, 'form-control']" :type="inputCurrent" v-model="currentPassword" v-validate="'required'"></b-form-input>
                                <div class="input-group-append">
                                    <b-btn @click="revealCurrent" class="btn btn-secondary" type="button">
                                        <i :class="[{'fa-eye-slash': !showCurrent}, {'fa-eye': showCurrent}, 'fa']"></i>
                                    </b-btn>
                                </div>
                            </div>
                            <fr-validation-error :validatorErrors="errors" fieldName="currentPassword"></fr-validation-error>
                        </b-form-group>

                        <fr-password-policy-input :policyApi="`${this.$root.userStore.state.managedResource}/${userId}`" v-model="newPassword">

                            <b-form-group class="mb-3" slot="custom-input">
                                <label for="newPassword">{{$t('pages.profile.accountSecurity.newPassword')}}</label>
                                <div class="form-label-password form-label-group mb-0">
                                    <b-form-input id="newPassword" :type="inputNew" v-model="newPassword" name="password" v-validate.initial="'required|policy'"></b-form-input>
                                    <div class="input-group-append">
                                        <button @click="revealNew" class="btn btn-secondary" type="button">
                                            <i :class="[{'fa-eye-slash': !showNew}, {'fa-eye': showNew}, 'fa']"></i>
                                        </button>
                                    </div>
                                </div>
                            </b-form-group>

                        </fr-password-policy-input>

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
import ValidationError from '@/components/utils/ValidationError';

/**
 * @description Allows a user to change their password, makes use of policy password component, similar to registration it will only allow a user to change password
 * as long as it passes policy requirements (policy.json).
 *
 */
export default {
    $_veeValidate: {
        validator: 'new'
    },
    name: 'Edit-Password',
    components: {
        'fr-list-item': ListItem,
        'fr-loading-button': LoadingButton,
        'fr-password-policy-input': PolicyPasswordInput,
        'fr-validation-error': ValidationError
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
            userId: this.$root.userStore.getUserState().userId
        };
    },
    methods: {
        clearComponent () {
            this.currentPassword = '';
            this.newPassword = '';
            this.errors.clear();
        },
        resetComponent () {
            this.loading = false;
            this.currentPassword = '';
            this.newPassword = '';
            this.$refs.cancel.click();
        },
        displayError (error) {
            if (error.response.status === 403) {
                this.errors.add({
                    field: 'currentPassword',
                    msg: 'Incorrect password provided'
                });
            }
        },
        onSavePassword () {
            const headers = {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-OpenIDM-Reauth-Password': this.encodeRFC5987IfNecessary(this.currentPassword)
                },
                payload = [{ operation: 'add', field: '/password', value: this.newPassword }],
                onSuccess = this.resetComponent.bind(this),
                onError = this.displayError.bind(this);

            this.errors.clear();

            this.$validator.validateAll().then((valid) => {
                if (valid) {
                    this.$emit('updateProfile', payload, { headers, onSuccess, onError });
                } else {
                    this.displayNotification('error', this.$t('pages.profile.accountSecurity.invalidPassword'));
                }
            });
        },
        validate () {
            return this.$validator.validateAll();
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
