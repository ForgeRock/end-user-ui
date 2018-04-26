<template>
    <b-form @submit.prevent id="kbaDefinition">
        <fr-horizontal-rule v-if="inline" insert="<i class='fa fa-lock'></i>"></fr-horizontal-rule>

        <p class="text-center">{{$t('common.user.kba.description')}}</p>

        <b-form-group label-text-align="left" class="mb-0"
            v-for="(answer, key) in answers" :key="key">

            <b-form-select class="mb-3" 
                v-model="selected[key].selected"
                :options="options" ></b-form-select>

            <fr-floating-label-input class="mb-3" type="text"
                v-if="selected[key].selected === numberOfQuestions"
                v-model.trim="answer.customQuestion"
                :fieldName="'question'"
                :label="'Question'"
                :validateRules="'required'"></fr-floating-label-input>

            <fr-floating-label-input class="mb-3" type="text"
                v-model.trim="answer.answer"
                :fieldName="'answer'"
                :label="'Answer'"
                :validateRules="'required'"></fr-floating-label-input>

            <hr v-if="key !== answers.length - 1">
        </b-form-group>

        <b-button v-if="!inline" @click="save" :block="true" variant="primary">{{$t("common.form.submit")}}</b-button>
    </b-form>
</template>

<script>
    import _ from 'lodash';
    import HorizontalRule from '@/components/utils/HorizontalRule';
    import FloatingLabelInput from '@/components/utils/FloatingLabelInput';

    export default {
        name: 'KBA-Security-Answer-Definition-Stage',
        props: {
            selfServiceDetails: { required: true },
            inline: {
                required: false,
                default: false
            }
        },
        $_veeValidate: {
            validator: 'new'
        },
        components: {
            'fr-horizontal-rule': HorizontalRule,
            'fr-floating-label-input': FloatingLabelInput
        },
        inject: ['$validator'],
        data: function () {
            let locale = this.$i18n.locale,
                numberOfQuestions = _.toString(this.selfServiceDetails.requirements.properties.kba.minItems),
                answers = _.times(numberOfQuestions, (n) => { return { answer: null, questionId: null, customQuestion: null }; }),
                selected = _.times(numberOfQuestions, () => { return {selected: null}; }),
                options = _.map(this.selfServiceDetails.requirements.properties.kba.questions, (question) => {
                    return { value: question.id, text: question.question[locale], disabled: false };
                });

            // 'placeholder' should be first item in options array and 'custom' should be last
            options.unshift({ value: null, text: this.$t('common.user.kba.selectQuestion'), disabled: true });
            options.push({ value: numberOfQuestions, text: this.$t('common.user.kba.custom'), disabled: false });

            return {
                selected: selected,
                options: options,
                answers: answers,
                numberOfQuestions: numberOfQuestions
            };
        },
        watch: {
            selected: {
                handler: function (value) {
                    // create array of selected options that aren't custom
                    let toDisable = _.map(this.selected, (s) => {
                        if (s.selected !== null && s.selected !== this.numberOfQuestions) {
                            return s.selected;
                        }
                    });

                    // set any [toDisable] option to disabled
                    _.each(this.options, (o) => {
                        if (_.includes(toDisable, o.value) || o.value === null) {
                            o.disabled = true;
                        } else {
                            o.disabled = false;
                        }
                    });
                },
                deep: true
            }
        },
        methods: {
            getData: function () {
                let saveArray = _.map(this.selected, (s, index) => {
                    let couplet = {};

                    // if custom question
                    if (s.selected === this.numberOfQuestions) {
                        couplet.customQuestion = this.answers[index].customQuestion;
                    } else {
                        couplet.questionId = s.selected;
                    }
                    couplet.answer = this.answers[index].answer;
                    return couplet;
                });

                return { kba: saveArray };
            },
            save: function () {
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

<style scoped>
</style>
