<template>
    <b-modal id="userDetailsModal" ref="fsModal" modal-class="fr-full-screen" cancel-variant="outline-secondary" @show="setModal" @keydown.enter.native.prevent="saveForm">
        <div slot="modal-header" class="d-flex w-100 h-100">
            <h5 class="modal-title align-self-center text-center">{{ title }}</h5>
            <button type="button" aria-label="Close" class="close" @click="hideModal"><i class="fa fa-times" /></button>
        </div>

        <!-- Editing profile currently only supports String, Number and Boolean-->
        <b-container>
            <b-row>
                <b-col sm="8" offset-sm="2">
                    <b-form v-if="formFields.length > 0" style="flex-direction: column;" class="mb-3 fr-edit-personal-form" name="edit-personal-form">
                        <template v-for="(field, index) in formFields">
                            <b-form-group v-if="field.type === 'string' || field.type === 'number'" :key="index" style="min-width: 200px;">
                                <label :for="field.title">{{ field.title }}</label>
                                <small v-if="!field.required" class="text-muted ml-1">{{ $t('pages.profile.editProfile.optional') }}</small>

                                <input
                                    v-if="field.type === 'string'"
                                    v-model.trim="formFields[index].value"
                                    v-validate="field.required ? 'required' : ''"
                                    data-vv-validate-on="submit"
                                    :name="field.name"
                                    :type="field.type"
                                    :class="[{'is-invalid': errors.has(field.name)}, 'form-control']"
                                    :data-vv-as="field.title"
                                >

                                <input
                                    v-else
                                    v-model.number="formFields[index].value"
                                    v-validate="field.required ? 'required' : ''"
                                    data-vv-validate-on="submit"
                                    :name="field.name"
                                    :type="field.type"
                                    :class="[{'is-invalid': errors.has(field.name)}, 'form-control']"
                                    :data-vv-as="field.title"
                                >
                                <fr-validation-error :validator-errors="errors" :field-name="field.name" />
                            </b-form-group>

                            <!-- for boolean values -->
                            <b-form-group v-if="field.type === 'boolean'" :key="index">
                                <div class="d-flex flex-column">
                                    <label class="mr-auto" :for="field.title">{{ field.title }}</label>

                                    <div class="mr-auto">
                                        <toggle-button
                                            class="mt-2 p-0 fr-toggle-primary"
                                            :height="28"
                                            :width="56"
                                            :sync="true"
                                            :css-colors="true"
                                            :labels="{checked: $t('common.form.yes'), unchecked: $t('common.form.no')}"
                                            :value="formFields[index].value"
                                            @change="formFields[index].value = !formFields[index].value"
                                        />
                                    </div>
                                </div>
                            </b-form-group>
                        </template>
                    </b-form>
                    <template v-else>
                        <h3 class="text-center">{{ $t('pages.profile.editProfile.noFields') }}</h3>
                    </template>
                </b-col>
            </b-row>
        </b-container>

        <div slot="modal-footer" class="w-100">
            <div class="float-right">
                <b-btn variant="outline-secondary mr-2" @click="hideModal">{{ $t('common.form.cancel') }}</b-btn>
                <b-btn type="button" variant="primary" :disabled="$root.userStore.state.internalUser" @click="saveForm">{{ $t('common.form.saveChanges') }}</b-btn>
            </div>
        </div>
    </b-modal>
</template>

<script>
import { cloneDeep, each, filter, includes, map } from "lodash";
import ValidationError from "../utils/ValidationError";
import ResourceMixin from "../utils/mixins/ResourceMixin";

/**
 * @description Displays a users profile, auto generates fields based off of resource schema. Currently only displays strings, numbers and booleans. In the case of a policy
 * save error it will highlight the appropriate field and display a policy error. For custom profile changes (e.g. adding a dropdown) this would be the primary file to add these
 * adjustments.
 *
 */
export default {
    "name": "Edit-Personal-Info",
    // eslint-disable-next-line sort-keys
    "$_veeValidate": {
        "validator": "new"
    },
    "components": {
        "fr-validation-error": ValidationError
    },
    data () {
        return {
            "formFields": [],
            "originalFormFields": [],
            "title": this.$t("pages.profile.editProfile.userDetailsTitle")
        };
    },
    "methods": {
        generateFormFields () {
            const { order, properties, required } = this.schema,
                filteredOrder = filter(order, (propName) => properties[propName].viewable &&
                            properties[propName].userEditable &&
                            properties[propName].type !== "array" &&
                            properties[propName].type !== "object"),
                formFields = map(filteredOrder, (name) => ({
                    "key": name,
                    name,
                    "required": includes(required, name),
                    "title": properties[name].title,
                    "type": properties[name].type,
                    "value": this.profile[name] || null
                }));

            return formFields;
        },
        hideModal () {
            this.$refs.fsModal.hide();
        },
        isValid () {
            return this.$validator.validateAll();
        },
        saveForm () {
            /* istanbul ignore next */
            this.isValid().then((valid) => {
                if (valid) {
                    const idmInstance = this.getRequestService(),
                        policyFields = {};

                    each(this.formFields, (field) => {
                        if (field.value !== null) {
                            policyFields[field.name] = field.value;
                        }
                    });

                    idmInstance.post(`policy/${this.$root.userStore.state.managedResource}/${this.$root.userStore.state.userId}?_action=validateObject`, policyFields).then((policyResult) => {
                        if (policyResult.data.failedPolicyRequirements.length === 0) {
                            this.$emit("updateProfile", this.generateUpdatePatch(this.originalFormFields, this.formFields));
                            this.errors.clear();
                            this.hideModal();
                        } else {
                            const generatedErrors = this.findPolicyError({
                                "data": {
                                    "detail": {
                                        "failedPolicyRequirements": policyResult.data.failedPolicyRequirements
                                    }
                                }
                            }, this.formFields);

                            this.errors.clear();

                            if (generatedErrors.length > 0) {
                                each(generatedErrors, (generatedError) => {
                                    if (generatedError.exists) {
                                        this.errors.add(generatedError);
                                    }
                                });
                            } else {
                                this.displayNotification("error", this.$t("pages.profile.editProfile.failedProfileSave"));
                            }
                        }
                    });
                }
            });
        },
        setModal () {
            const formFields = this.generateFormFields();

            this.formFields = formFields;
            this.originalFormFields = cloneDeep(formFields);
        }
    },
    "mixins": [ResourceMixin],
    mounted () {
        if (this.autoOpen) {
            this.$root.$emit("bv::show::modal", "userDetailsModal");
        }
    },
    "props": {
        "autoOpen": { "default": false, "required": false, "type": Boolean },
        "profile": { "required": true, "type": Object },
        "schema": { "required": true, "type": Object }
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
