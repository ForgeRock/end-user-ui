<template>
    <b-form>
        <b-form-group class="mb-0" v-for="(property, key) in userDetails" :key="key">
            <fr-floating-label-input
                :fieldName="key"
                :label="property.description"
                :validateRules="property.required ? 'required' : ''"
                type="text"
                v-model="saveDetails[key]"></fr-floating-label-input>
        </b-form-group>

        <b-form-group class="mb-0">
            <fr-floating-label-input
                fieldName="password"
                :label="$t('common.placeholders.password')"
                :validateRules="'required'"
                type="password"
                v-model="saveDetails.password"></fr-floating-label-input>
        </b-form-group>

        <!-- Vue Bootstrap custom radio button seems to have problems so just using none component-->
        <div class="form-group mb-4">
            <div v-for="(preference, key) in userPreferences" :key="key" class="custom-control custom-checkbox mb-2">
                <input v-model="saveDetails.preferences[key]" type="checkbox" class="custom-control-input" :id="key">
                <label class="custom-control-label" :for="key">{{preference.description}}</label>
            </div>
        </div>

        <b-button v-if="inline === false" @click="save" :block="true" variant="primary">
            {{$t("common.form.submit")}}
        </b-button>
    </b-form>
</template>

<script>
    import _ from 'lodash';
    import FloatingLabelInput from '@/components/utils/FloatingLabelInput';

    // TODO Improve validation to handle more then just required / confirm password
    export default {
        name: 'User-Details',
        components: {
            'fr-floating-label-input': FloatingLabelInput
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
        data: function () {
            var data = {
                userDetails: {},
                saveDetails: {},
                userPreferences: {}
            };

            if (this.selfServiceDetails.requirements && this.selfServiceDetails.requirements.registrationProperties) {
                data.userDetails = this.selfServiceDetails.requirements.registrationProperties.properties;

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
            getData: function () {
                var details = _.clone(this.saveDetails);

                delete details.confirmPassword;

                return {
                    user: details
                };
            },

            save: function () {
                // Need to ignore this validation because it does not preform in testing due to vue validate
                /* istanbul ignore next */
                this.isValid().then((valid) => {
                    if (valid) {
                        this.$emit('saveSelfService', this.getData());
                    }
                });
            },

            isValid: function () {
                /* istanbul ignore next */
                return this.$validator.validateAll();
            }
        }
    };
</script>

<style scoped lang="scss"></style>