<template>
    <fr-list-item :collapsible="true" :panel-shown="false">
        <div slot="list-item-header" class="d-inline-flex w-100 media">
            <div class="media-body align-self-center">
                <h6>{{ $t('pages.profile.accountSecurity.password') }}</h6>
            </div>
            <div class="d-flex ml-3 align-self-center">
                <div v-show="showCancelButton" ref="cancel" class="btn btn-sm btn-link float-right btn-cancel" @click="clearComponent()">{{ $t('common.form.cancel') }}</div>
                <div v-show="!showCancelButton" class="btn btn-sm btn-link float-right btn-edit" @click="showCancelButton = true">{{ $t('common.form.reset') }}</div>
            </div>
        </div>

        <div slot="list-item-collapse-body" class="d-inline-flex w-100">
            <b-form class="w-100">
                <b-row>
                    <b-col sm="8">
                        <b-form-group>
                            <label for="currentPassword">{{ $t('pages.profile.accountSecurity.currentPassword') }}</label>
                            <div class="form-label-password form-label-group mb-0">
                                <b-form-input
                                    id="currentPassword"
                                    v-model="currentPassword"
                                    v-validate="'required'"
                                    name="currentPassword"
                                    data-vv-validate-on="submit"
                                    :data-vv-as="$t('pages.profile.accountSecurity.currentPassword')"
                                    :class="[{'is-invalid': errors.has('currentPassword')}, 'form-control']"
                                    :type="inputCurrent"
                                />
                                <div class="input-group-append">
                                    <b-btn class="btn btn-secondary" type="button" @click="revealCurrent">
                                        <i :class="[{'fa-eye-slash': !showCurrent}, {'fa-eye': showCurrent}, 'fa']" />
                                    </b-btn>
                                </div>
                            </div>
                            <fr-validation-error :validator-errors="errors" field-name="currentPassword" />
                        </b-form-group>

                        <fr-password-policy-input v-model="newPassword" :policy-api="`${this.$root.userStore.state.managedResource}/${userId}`">
                            <b-form-group slot="custom-input" class="mb-3">
                                <label for="newPassword">{{ $t('pages.profile.accountSecurity.newPassword') }}</label>
                                <div class="form-label-password form-label-group mb-0">
                                    <b-form-input id="newPassword" v-model="newPassword" v-validate.initial="'required|policy'" :type="inputNew" name="password" />
                                    <div class="input-group-append">
                                        <button class="btn btn-secondary" type="button" @click="revealNew">
                                            <i :class="[{'fa-eye-slash': !showNew}, {'fa-eye': showNew}, 'fa']" />
                                        </button>
                                    </div>
                                </div>
                            </b-form-group>
                        </fr-password-policy-input>

                        <fr-loading-button
                            type="button"
                            variant="primary"
                            class="ld-ext-right mb-3"
                            :label="$t('pages.profile.accountSecurity.savePassword')"
                            :loading="loading"
                            @click="onSavePassword"
                        />

                        <div v-if="this.$root.applicationStore.state.passwordReset" class="text-nowrap pb-2">{{ $t('pages.profile.accountSecurity.rememberPassword') }} <router-link to="PasswordReset">{{ $t('pages.profile.accountSecurity.resetPassword') }}</router-link></div>
                    </b-col>
                </b-row>
            </b-form>
        </div>
    </fr-list-item>
</template>
<script>
import ListItem from "../utils/ListItem";
import LoadingButton from "../utils/LoadingButton";
import PolicyPasswordInput from "../utils/PolicyPasswordInput";
import ValidationError from "../utils/ValidationError";

/**
 * @description Allows a user to change their password, makes use of policy password component, similar to registration it will only allow a user to change password
 * as long as it passes policy requirements (policy.json).
 *
 */
export default {
    "name": "Edit-Password",
    // eslint-disable-next-line sort-keys
    "$_veeValidate": {
        "validator": "new"
    },
    "components": {
        "fr-list-item": ListItem,
        "fr-loading-button": LoadingButton,
        "fr-password-policy-input": PolicyPasswordInput,
        "fr-validation-error": ValidationError
    },
    data () {
        return {
            "currentPassword": "",
            "inputCurrent": "password",
            "inputNew": "password",
            "loading": false,
            "newPassword": "",
            "showCancelButton": false,
            "showCurrent": true,
            "showNew": true,
            "userId": this.$root.userStore.getUserState().userId
        };
    },
    "methods": {
        clearComponent () {
            this.currentPassword = "";
            this.newPassword = "";
            this.errors.clear();
            this.showCancelButton = false;
        },
        displayError (error) {
            if (error.response.status === 403) {
                this.errors.add({
                    "field": "currentPassword",
                    "msg": "Incorrect password provided"
                });
            }
        },
        onSavePassword () {
            const headers = {
                    "X-OpenIDM-Reauth-Password": this.encodeRFC5987IfNecessary(this.currentPassword),
                    "X-Requested-With": "XMLHttpRequest"
                },
                onError = this.displayError.bind(this),
                onSuccess = this.resetComponent.bind(this),
                payload = [{ "field": "/password", "operation": "add", "value": this.newPassword }];

            this.errors.clear();

            this.$validator.validateAll().then((valid) => {
                if (valid) {
                    this.$emit("updateProfile", payload, { headers, onError, onSuccess });
                } else {
                    this.displayNotification("error", this.$t("pages.profile.accountSecurity.invalidPassword"));
                }
            });
        },
        resetComponent () {
            this.loading = false;
            this.currentPassword = "";
            this.newPassword = "";
            this.$refs.cancel.click();
        },
        revealCurrent () {
            if (this.inputCurrent === "password") {
                this.inputCurrent = "text";
                this.showCurrent = false;
            } else {
                this.inputCurrent = "password";
                this.showCurrent = true;
            }
        },
        revealNew () {
            if (this.inputNew === "password") {
                this.inputNew = "text";
                this.showNew = false;
            } else {
                this.inputNew = "password";
                this.showNew = true;
            }
        },
        validate () {
            return this.$validator.validateAll();
        }
    }
};
</script>
