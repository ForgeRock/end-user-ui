<template>
    <b-modal id="userDetailsModal" class="fr-full-screen" ref="fsModal" cancel-variant="outline-secondary" @keydown.enter.native.prevent="saveForm">

        <div slot="modal-header" class="d-flex w-100 h-100">
            <h5 class="modal-title align-self-center text-center">{{title}}</h5>
            <button type="button" aria-label="Close" class="close" @click="hideModal"><i class="fa fa-times"></i></button>
        </div>

        <b-container>
            <b-row>
                <b-col sm="8" offset-sm="2">
                    <b-form class="mb-3" v-for="(field, index) in formFields" :key="index" data-vv-scope="personal-info-form">
                        <b-form-group v-if="field.type !== 'boolean'">
                            <label class="float-left" :for="field.title">{{field.title}}</label>
                            <small v-if="!field.required" class="text-muted ml-1">{{$t('pages.profile.editProfile.optional')}}</small>

                            <input v-validate="field.required ? 'required' : ''" data-vv-validate-on="submit"
                                :name="field.name"
                                :type="field.type"
                                :class="[{'is-invalid': errors.has(field.name)}, 'form-control']"
                                v-model.trim="formFields[index].value">

                            <fr-validation-error :validatorErrors="errors" :fieldName="field.name"></fr-validation-error>
                        </b-form-group>

                        <!-- for boolean values -->
                        <b-form-group v-else>
                            <div class="d-flex flex-column">
                                <label class="mr-auto" :for="field.title">{{field.title}}</label>

                                <div class="mr-auto">
                                    <toggle-button class="mt-2 p-0 fr-toggle-primary"
                                        :height="28"
                                        :width="56"
                                        :sync="true"
                                        :cssColors="true"
                                        :labels="{checked: 'Yes', unchecked: 'No'}"
                                        :value="formFields[index].value"
                                        @change="formFields[index].value = !formFields[index].value"/>
                                </div>
                            </div>
                        </b-form-group>
                    </b-form>
                </b-col>
            </b-row>
        </b-container>

        <div slot="modal-footer" class="w-100">
            <div class="float-right">
                <b-btn variant="outline-secondary" @click="hideModal">{{$t('common.form.cancel')}}</b-btn>
                <b-btn type="button" variant="primary" @click="saveForm">{{$t('common.form.saveChanges')}}</b-btn>
            </div>
        </div>
    </b-modal>
</template>

<script>
    import _ from 'lodash';
    import colors from '@/scss/main.scss';
    import ListGroup from '@/components/utils/ListGroup';
    import ValidationError from '@/components/utils/ValidationError';

    export default {
        name: 'Edit-Personal-Info',
        components: {
            'fr-validation-error': ValidationError,
            'fr-list-group': ListGroup
        },
        $_veeValidate: {
            validator: 'new'
        },
        props: {
            schema: { type: Object, required: true },
            profile: { type: Object, required: true }
        },
        data () {
            let formFields = this.generateFormFields();
            return {
                color: colors.primary,
                formFields,
                originalFormFields: _.cloneDeep(formFields),
                title: this.$t('pages.profile.editProfile.userDetailsTitle')
            };
        },
        methods: {
            generateFormFields () {
                let {order, properties, required} = this.schema,
                    filteredOrder = _.filter(order, (propName) => {
                        return properties[propName].viewable &&
                            properties[propName].userEditable &&
                            properties[propName].type !== 'array' &&
                            properties[propName].type !== 'object';
                    }),
                    formFields = _.map(filteredOrder, (name) => {
                        return {
                            name: name,
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
            createPatches (o, n) {
                let originalFrom = _.cloneDeep(o),
                    newForm = _.cloneDeep(n),
                    changes = _.filter(newForm, (field, index) => {
                        if (field.value !== originalFrom[index].value) {
                            return true;
                        }
                        return false;
                    });

                return _.map(changes, (formField) => {
                    if (formField.value === '' || formField.value === null) {
                        return {operation: 'remove', field: '/' + formField.name};
                    } else {
                        return {operation: 'add', field: '/' + formField.name, value: formField.value};
                    }
                });
            },
            saveForm () {
                /* istanbul ignore next */
                this.isValid().then((valid) => {
                    if (valid) {
                        this.$emit('updateProfile', this.createPatches(this.originalFormFields, this.formFields));
                        this.hideModal();
                    }
                });
            },
            isValid () {
                return this.$validator.validateAll('personal-info-form');
            }
        }
    };
</script>

<style lang="scss">
    @import '../../scss/full-screen-modal';
</style>