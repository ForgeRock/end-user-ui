<template>
    <fr-list-item :collapsible="true" :panelShown="false">
        <div slot="list-item-header" class="d-inline-flex w-100 media">
            <div class="media-body align-self-center">
                <h6 class="my-0">{{$t('pages.profile.accountSecurity.securityQuestions')}}</h6>
            </div>
            <div class="d-flex ml-3 align-self-center">
                <div class="btn btn-link btn-sm float-right btn-cancel">{{$t('common.form.cancel')}}</div>
                <div class="btn btn-link btn-sm float-right btn-edit">{{$t('common.form.edit')}}</div>
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
                                <label for="inputAnswer1">{{$t('common.user.kba.answer')}}</label>
                                <b-form-input type="text" class="form-control"
                                    v-model.trim="select.answer" 
                                    v-validate="'required'"
                                    data-vv-validate-on="submit"
                                    :name="$t('common.user.kba.answer') + select.index"
                                    :class="[{'is-invalid': errors.has($t('common.user.kba.answer') + select.index)}, 'form-control']"></b-form-input>

                                <fr-validation-error :validatorErrors="errors" :fieldName="$t('common.user.kba.answer') + select.index"></fr-validation-error>
                            </div>

                            <hr v-if="id !== selected.length - 1" class="mb-3 mt-4">
                        </fieldset>
                        
                        <b-button type="button" variant="primary" @click="onSaveKBA">
                            {{$t('common.form.save')}}
                            <div class="ld ld-ring ld-spin"></div>
                        </b-button>
                    </b-col>
                </b-row>
            </b-form>
        </div>
    </fr-list-item>
</template>

<script>
    import _ from 'lodash';
    import ListItem from '@/components/utils/ListItem';
    import ValidationError from '@/components/utils/ValidationError';

    export default {
        name: 'Edit-KBA',
        components: {
            'fr-list-item': ListItem,
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
                customIndex: null
            };
        },
        mounted () {
            this.questions = this.kbaData.questions;
            this.initializeForm(this.kbaData.minimumAnswersToDefine);
        },
        methods: {
            initializeForm (minimumRequired) {
                let locale = this.$i18n.locale;

                // set form state based on stored user questions
                _.times(minimumRequired, (index) => {
                    this.selected.push({selected: null, index: index + 1, answer: '', custom: ''});
                });

                // create select options
                this.selectOptions = _.map(this.questions, (question, key) => {
                    return {value: key, text: question[locale], disabled: true};
                });

                this.customIndex = this.selectOptions.length + 1;
                this.selectOptions.unshift({value: null, text: this.$t('common.user.kba.selectQuestion'), disabled: true});
                this.selectOptions.push({value: this.customIndex, text: this.$t('common.user.kba.custom'), disabled: false});
            },
            onSaveKBA () {
                /* istanbul ignore next */
                this.isValid().then((valid) => {
                    /* istanbul ignore next */
                    if (valid) {
                        let userId = this.$root.userStore.getUserState().userId,
                            selfServiceInstance = this.getRequestService({
                                headers: {
                                    'X-OpenIDM-NoSession': true,
                                    'X-OpenIDM-Password': 'anonymous',
                                    'X-OpenIDM-Username': 'anonymous'
                                }
                            }),
                            values = _.map(this.selected, (field) => {
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
                            }),
                            patch = [{
                                operation: 'replace',
                                field: '/kbaInfo',
                                value: values
                            }];
    
                        selfServiceInstance.patch(`managed/user/${userId}`, patch).then((response) => {
                            _.each(this.selected, (s) => {
                                s.answer = '';
                            });

                            this.$notify({
                                group: 'IDMMessages',
                                type: 'success',
                                text: this.$t('common.user.profile.updateSuccess')
                            });
                        })
                        .catch((error) => {
                            /* istanbul ignore next */
                            this.$notify({
                                group: 'IDMMessages',
                                type: 'error',
                                text: error.response.data.message
                            });
                        });
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
            }
        }
    };
</script>
