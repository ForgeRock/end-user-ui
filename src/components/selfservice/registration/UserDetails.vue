<template>
    <b-form>
        <b-form-group v-for="(property, key) in userDetails" :key="key">
            <b-input-group>
                <b-form-input :name="key" v-validate="property.required ? 'required' : ''" :class="{'is-invalid': errors.has(key) }" v-model="saveDetails[key]" :placeholder="property.description"></b-form-input>
                <div v-show="errors.has(key)" class="invalid-tooltip">
                    {{errors.first(key)}}
                </div>
            </b-input-group>
        </b-form-group>

        <b-form-group>
            <b-input-group>
                <b-form-input type="password" name="password" v-validate="'confirmed:confirmPassword|required'" :class="{'is-invalid': errors.has('password') }" v-model="saveDetails.password" :placeholder="$t('common.placeholders.password')"></b-form-input>
                <div v-show="errors.has('password')" class="invalid-tooltip">
                    {{errors.first('password')}}
                </div>
            </b-input-group>
        </b-form-group>
        <b-form-group>
            <b-input-group>
                <b-form-input type="password" name="confirmPassword" :class="{'is-invalid': errors.has('password') }" v-model="saveDetails.confirmPassword" :placeholder="$t('common.placeholders.retypePassword')"></b-form-input>
            </b-input-group>
        </b-form-group>

        <b-form-group v-for="(preference, key) in userPreferences" :key="key">
            <b-input-group>
                <b-form-checkbox plain v-model="saveDetails.preferences[key]">{{preference.description}}</b-form-checkbox>
            </b-input-group>
        </b-form-group>
    </b-form>
</template>

<script>
    import _ from 'lodash';

    // TODO Improve validation to handle more then just required / confirm password
    export default {
        name: 'User-Details',
        props: {
            selfServiceDetails: { required: true }
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

            isValid: function () {
                return this.$validator.validateAll();
            }
        }
    };
</script>

<style scoped lang="scss">

</style>