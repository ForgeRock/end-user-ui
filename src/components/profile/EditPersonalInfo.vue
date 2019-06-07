<template>
    <b-modal id="userDetailsModal" modal-class="fr-full-screen" ref="fsModal" cancel-variant="outline-secondary" @show="setModal" @keydown.enter.native.prevent="saveForm">

        <div slot="modal-header" class="d-flex w-100 h-100">
            <h5 class="modal-title align-self-center text-center">{{title}}</h5>
            <button type="button" aria-label="Close" class="close" @click="hideModal"><i class="fa fa-times"></i></button>
        </div>

        <!-- Editing profile currently only supports String, Number and Boolean-->
        <b-container>
            <b-row>
                <b-col sm="8" offset-sm="2">
                    <b-form style="flex-direction: column;" v-if="formFields.length > 0" class="mb-3 fr-edit-personal-form" name="edit-personal-form">
                        <template v-for="(field, index) in formFields">
                            <b-form-group style="min-width: 200px;" :key="index" v-if="field.type === 'string' || field.type === 'number'">
                                <label :for="field.title">{{field.title}}</label>
                                <small v-if="!field.required" class="text-muted ml-1">{{$t('pages.profile.editProfile.optional')}}</small>

                                <input v-if="field.type === 'string'" v-validate="field.required ? 'required' : ''" data-vv-validate-on="submit"
                                       :name="field.name"
                                       :type="field.type"
                                       :class="[{'is-invalid': errors.has(field.name)}, 'form-control']"
                                       :data-vv-as="field.title"
                                       v-model.trim="formFields[index].value">

                                <input v-else v-validate="field.required ? 'required' : ''" data-vv-validate-on="submit"
                                       :name="field.name"
                                       :type="field.type"
                                       :class="[{'is-invalid': errors.has(field.name)}, 'form-control']"
                                       :data-vv-as="field.title"
                                       v-model.number="formFields[index].value">
                                <fr-validation-error :validatorErrors="errors" :fieldName="field.name"></fr-validation-error>
                            </b-form-group>

                            <!-- for boolean values -->
                            <b-form-group :key="index" v-if="field.type === 'boolean'">
                                <div class="d-flex flex-column">
                                    <label class="mr-auto" :for="field.title">{{field.title}}</label>

                                    <div class="mr-auto">
                                        <toggle-button class="mt-2 p-0 fr-toggle-primary"
                                                       :height="28"
                                                       :width="56"
                                                       :sync="true"
                                                       :cssColors="true"
                                                       :labels="{checked: $t('common.form.yes'), unchecked: $t('common.form.no')}"
                                                       :value="formFields[index].value"
                                                       @change="formFields[index].value = !formFields[index].value"/>
                                    </div>
                                </div>
                            </b-form-group>
                        </template>
                    </b-form>
                    <template v-else>
                        <h3 class="text-center">{{$t('pages.profile.editProfile.noFields')}}</h3>
                    </template>
                </b-col>
            </b-row>
        </b-container>

        <div slot="modal-footer" class="w-100">
            <div class="float-right">
                <b-btn variant="outline-secondary mr-2" @click="hideModal">{{$t('common.form.cancel')}}</b-btn>
                <b-btn type="button" variant="primary" :disabled="$root.userStore.state.internalUser" @click="saveForm">{{$t('common.form.saveChanges')}}</b-btn>
            </div>
        </div>
    </b-modal>
</template>

<script>
import _ from 'lodash';
import ValidationError from '@/components/utils/ValidationError';
import ResourceMixin from '@/components/utils/mixins/ResourceMixin';

/**
 * @description Displays a users profile, auto generates fields based off of resource schema. Currently only displays strings, numbers and booleans. In the case of a policy
 * save error it will highlight the appropriate field and display a policy error. For custom profile changes (e.g. adding a dropdown) this would be the primary file to add these
 * adjustments.
 *
 */
export default {
    name: 'Edit-Personal-Info',
    mixins: [
        ResourceMixin
    ],
    components: {
        'fr-validation-error': ValidationError
    },
    $_veeValidate: {
        validator: 'new'
    },
    props: {
        schema: { type: Object, required: true },
        profile: { type: Object, required: true },
        autoOpen: { type: Boolean, required: false, default: false }
    },
    data () {
        return {
            formFields: [],
            originalFormFields: [],
            title: this.$t('pages.profile.editProfile.userDetailsTitle')
        };
    },
    mounted () {
        if (this.autoOpen) {
            this.$root.$emit('bv::show::modal', 'userDetailsModal');
        }
    },
    methods: {
        generateFormFields () {
            let { order, properties, required } = this.schema,
                filteredOrder = _.filter(order, (propName) => {
                    return properties[propName].viewable &&
                            properties[propName].userEditable &&
                            properties[propName].type !== 'array' &&
                            properties[propName].type !== 'object';
                }),
                formFields = _.map(filteredOrder, (name) => {
                    return {
                        name: name,
                        key: name,
                        title: properties[name].title,
                        value: this.profile[name] || null,
                        type: properties[name].type,
                        required: _.includes(required, name)
                    };
                });

            return formFields;
        },
        hideModal () {
            this.$refs.fsModal.hide();
        },
        setModal () {
            let formFields = this.generateFormFields();

            this.formFields = formFields;
            this.originalFormFields = _.cloneDeep(formFields);
        },
        saveForm () {
            /* istanbul ignore next */
            this.isValid().then((valid) => {
                if (valid) {
                    const idmInstance = this.getRequestService();
                    let policyFields = {};

                    _.each(this.formFields, (field) => {
                        if (field.value !== null) {
                            policyFields[field.name] = field.value;
                        }
                    });

                    idmInstance.post(`policy/${this.$root.userStore.state.managedResource}/${this.$root.userStore.state.userId}?_action=validateObject`, policyFields).then((policyResult) => {
                        if (policyResult.data.failedPolicyRequirements.length === 0) {
                            this.$emit('updateProfile', this.generateUpdatePatch(this.originalFormFields, this.formFields));
                            this.errors.clear();
                            this.hideModal();
                        } else {
                            let generatedErrors = this.findPolicyError({
                                data: {
                                    detail: {
                                        failedPolicyRequirements: policyResult.data.failedPolicyRequirements
                                    }
                                }
                            }, this.formFields);

                            this.errors.clear();

                            if (generatedErrors.length > 0) {
                                _.each(generatedErrors, (generatedError) => {
                                    if (generatedError.exists) {
                                        this.errors.add(generatedError);
                                    }
                                });
                            } else {
                                this.displayNotification('error', this.$t('pages.profile.editProfile.failedProfileSave'));
                            }
                        }
                    });
                }
            });
        },
        isValid () {
            return this.$validator.validateAll();
        }
    }
};
</script>

<style lang="scss">
    @import '../../scss/full-screen-modal';

    _:-ms-fullscreen, :root {
        #userDetailsModal {
            .row {
                min-width: 900px;
            }
            .fr-edit-personal-form {
                min-width: 900px;
            }
        }
    }

    @media only screen and (max-width: 700px) {
        _:-ms-fullscreen, :root {
            #userDetailsModal {
                .row {
                    min-width: 200px;
                }
                .fr-edit-personal-form {
                    min-width: 200px;
                }
            }
        }

    }
</style>
