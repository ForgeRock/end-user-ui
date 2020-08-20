<template>
    <b-form>
        <fr-social-buttons v-if="!isSocialReg" :signin="false"></fr-social-buttons>
        <b-form-group class="mb-0" v-for="(property, key) in userDetails" :key="key">
            <fr-floating-label-input
                    :defaultValue="property.socialValue"
                    :fieldName="key"
                    :label="property.description"
                    :validateRules="calculateValidation(property)"
                    type="text"
                    v-model="saveDetails[key]"></fr-floating-label-input>
        </b-form-group>

        <fr-policy-password-input v-if="!isSocialReg" policyApi="selfservice/registration" v-model="saveDetails.password" name="password"></fr-policy-password-input>

        <!-- Vue Bootstrap custom radio button seems to have problems so just using none component-->
        <div class="form-group mb-4">
            <div v-for="(preference, key) in userPreferences" :key="key" class="custom-control custom-checkbox mb-2">
                <input v-model="saveDetails.preferences[key]" type="checkbox" class="custom-control-input" :id="key">
                <label class="custom-control-label" :for="key">{{preference.description}}</label>
            </div>
        </div>

        <b-button v-if="inline === false" @click="save" :block="true" size="lg" variant="primary">
            {{$t("common.form.signUp")}}
        </b-button>
    </b-form>
</template>

<script>
import _ from 'lodash';
import FloatingLabelInput from '@/components/utils/FloatingLabelInput';
import PolicyPasswordInput from '@/components/utils/PolicyPasswordInput';
import SocialButtons from '@/components/utils/SocialButtons';

/**
 * @description Selfservice stage for generating user details and displaying social buttons available. Works the same alone and in allinone
 *
 **/
export default {
    name: 'User-Details',
    components: {
        'fr-floating-label-input': FloatingLabelInput,
        'fr-policy-password-input': PolicyPasswordInput,
        'fr-social-buttons': SocialButtons
    },
    $_veeValidate: {
        validator: 'new'
    },
    props: {
        selfServiceDetails: { required: true },
        inline: {
            required: false,
            default: false
        }
    },
    data () {
        let data = {
            userDetails: {},
            saveDetails: {},
            userPreferences: {},
            isSocialReg: _.get(this.selfServiceDetails, 'tag') !== 'initial'
        };

        if (this.selfServiceDetails.requirements && this.selfServiceDetails.requirements.registrationProperties) {
            data.userDetails = this.selfServiceDetails.requirements.registrationProperties.properties;

            if (_.has(this.selfServiceDetails, 'requirements.properties.user.default') &&
                    !_.isUndefined(this.selfServiceDetails, 'requirements.properties.user.default')) {
                _.each(this.selfServiceDetails.requirements.properties.user.default, (value, key) => {
                    data.userDetails[key].socialValue = value;
                });
            }

            _.each(this.selfServiceDetails.requirements.registrationProperties.required, (prop) => {
                data.userDetails[prop].required = true;
            });

            _.each(this.selfServiceDetails.requirements.registrationProperties.properties, (value, key) => {
                data.saveDetails[key] = '';
            });
        }

        if (this.selfServiceDetails.requirements && this.selfServiceDetails.requirements.registrationPreferences) {
            data.saveDetails.preferences = {};
            data.userPreferences = this.selfServiceDetails.requirements.registrationPreferences;

            _.each(data.userPreferences, (value, key) => {
                data.saveDetails.preferences[key] = false;
            });
        }

        data.saveDetails.password = '';

        return data;
    },
    methods: {
        getData () {
            let details = _.clone(this.saveDetails);

            delete details.confirmPassword;

            if (this.isSocialReg) {
                delete details.password;
            }

            return {
                user: details
            };
        },

        // Add additional frontend checks for field validation here
        calculateValidation (property) {
            let validators = [];

            if (property.required) {
                validators.push('required');
            }

            if (property.policies) {
                // Add policy vee validators correlations here
                _.each(property.policies, (policy) => {
                    if (policy.policyId === 'valid-email-address-format') {
                        validators.push('email');
                    }
                });
            }

            return validators.join('|');
        },

        save () {
            // Need to ignore this validation because it does not preform in testing due to vue validate
            /* istanbul ignore next */
            this.isValid().then((valid) => {
                if (valid) {
                    this.$emit('advanceStage', this.getData());
                } else {
                    this.displayNotification('error', this.$t('pages.selfservice.registration.pleaseComplete'));
                }
            });
        },

        isValid () {
            /* istanbul ignore next */
            return this.$validator.validateAll();
        }
    }
};
</script>

<style scoped lang="scss"></style>
