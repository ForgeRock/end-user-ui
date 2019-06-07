<template>
    <fr-list-item :collapsible="true" :panelShown="false">
        <div slot="list-item-header" class="d-inline-flex w-100 media">
            <div class="media-body align-self-center">
                <h6 class="my-0">{{$t('pages.profile.accountSecurity.securityQuestions')}}</h6>
            </div>
            <div class="d-flex ml-3 align-self-center">
                <div class="btn btn-link btn-sm float-right btn-cancel" @click="clearComponent()" ref="cancel">{{$t('common.form.cancel')}}</div>
                <div class="btn btn-link btn-sm float-right btn-edit">{{$t('common.form.reset')}}</div>
            </div>
        </div>

        <div v-if="selected.length" slot="list-item-collapse-body" class="d-inline-flex w-100">
            <b-form class="w-100">
                <b-row>
                    <b-col sm="8">
                        <fieldset v-for="(select, id) in selected" :key="id" class="pb-3">

                            <label>{{$t('common.user.kba.question')}} {{select.index}}</label>
                            <b-form-select class="mb-3"
                                v-model="select.selected"
                                :options="selectOptions"></b-form-select>

                            <div v-if="select && select.selected === customIndex" class="pb-3">
                                <label>{{$t('pages.profile.accountSecurity.custom')}}</label>
                                <b-form-input type="text"
                                    v-model.trim="select.custom"
                                    v-validate="'required'"
                                    data-vv-validate-on="submit"
                                    :name="$t('pages.profile.accountSecurity.custom')  + select.index"
                                    :class="[{'is-invalid': errors.has($t('pages.profile.accountSecurity.custom') + select.index)}, 'form-control']"></b-form-input>

                                <fr-validation-error :validatorErrors="errors" :fieldName="$t('pages.profile.accountSecurity.custom') + select.index"></fr-validation-error>
                            </div>

                            <div class="form-group mb-0">
                                <label>{{$t('common.user.kba.answer')}}</label>
                                <b-form-input type="text" class="form-control"
                                    v-model.trim="select.answer"
                                    v-validate="'required'"
                                    data-vv-validate-on="submit"
                                    :data-vv-as="$t('common.user.kba.answer')"
                                    :name="$t('common.user.kba.answer') + select.index"
                                    :class="[{'is-invalid': errors.has($t('common.user.kba.answer') + select.index)}, 'form-control']"></b-form-input>

                                <fr-validation-error :validatorErrors="errors" :fieldName="$t('common.user.kba.answer') + select.index"></fr-validation-error>
                            </div>

                            <hr v-if="id !== selected.length - 1" class="mb-3 mt-4">
                        </fieldset>

                        <fr-loading-button type="button" variant="primary" class="ld-ext-right mb-3"
                            :label="$t('common.user.kba.saveQuestions')"
                            :loading="loading"
                            @click="onSaveKBA"></fr-loading-button>
                    </b-col>
                </b-row>
            </b-form>
        </div>
    </fr-list-item>
</template>

<script>
import _ from 'lodash';
import ListItem from '@/components/utils/ListItem';
import LoadingButton from '@/components/utils/LoadingButton';
import ValidationError from '@/components/utils/ValidationError';

/**
 * @description Allows a user to change their KBA, will ensure based on KBA configuration a user must match the systems KBA requirements.
 *
 */
export default {
    name: 'Edit-KBA',
    components: {
        'fr-list-item': ListItem,
        'fr-loading-button': LoadingButton,
        'fr-validation-error': ValidationError
    },
    $_veeValidate: {
        validator: 'new'
    },
    props: ['kbaData'],
    data () {
        return {
            questions: {},
            selectOptions: [],
            selected: [],
            customIndex: null,
            loading: false
        };
    },
    mounted () {
        this.questions = this.kbaData.questions;
        this.initializeForm(this.kbaData.minimumAnswersToDefine);
    },
    methods: {
        initializeForm (minimumRequired) {
            let { locale, fallbackLocale } = this.$i18n;

            // set form state based on stored user questions
            _.times(minimumRequired, (index) => {
                this.selected.push({ selected: null, index: index + 1, answer: '', custom: '' });
            });

            // create select options
            this.selectOptions = _.map(this.questions, (question, key) => {
                return { value: key, text: question[locale] || question[fallbackLocale], disabled: true };
            });

            this.customIndex = this.selectOptions.length + 1;
            this.selectOptions.unshift({ value: null, text: this.$t('common.user.kba.selectQuestion'), disabled: true });
            this.selectOptions.push({ value: this.customIndex, text: this.$t('common.user.kba.custom'), disabled: false });
        },

        generatePatch () {
            let values = _.map(this.selected, (field) => {
                if (field.custom) {
                    return {
                        answer: field.answer,
                        customQuestion: field.custom
                    };
                } else {
                    return {
                        answer: field.answer,
                        questionId: field.selected
                    };
                }
            });

            return [{
                operation: 'replace',
                field: '/kbaInfo',
                value: values
            }];
        },

        clearComponent () {
            this.loading = false;

            this.questions = {};
            this.selectOptions = [];
            this.selected = [];
            this.customIndex = null;

            this.questions = this.kbaData.questions;
            this.initializeForm(this.kbaData.minimumAnswersToDefine);

            this.errors.clear();
        },

        onSaveKBA () {
            this.isValid().then((valid) => {
                if (valid) {
                    this.loading = true;

                    this.$emit('updateKBA', this.generatePatch(), { onSuccess: () => {
                        this.$refs.cancel.click();
                    } });
                }
            });
        },

        isValid () {
            /* istanbul ignore next */
            return this.$validator.validateAll();
        }
    },
    watch: {
        selected: {
            handler (value) {
                // create array of selected options that aren't custom
                let toDisable = _.map(this.selected, (s) => {
                    if (s.selected !== null && s.selected !== this.customIndex) {
                        return s.selected;
                    }
                });

                // set any [toDisable] option to disabled
                _.each(this.selectOptions, (o) => {
                    if (_.includes(toDisable, o.value) || o.value === null) {
                        o.disabled = true;
                    } else {
                        o.disabled = false;
                    }
                });
            },
            deep: true
        },
        kbaData: { deep: true, handler: _.noop }
    }
};
</script>
