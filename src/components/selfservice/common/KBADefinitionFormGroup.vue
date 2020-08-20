<template>
    <div>
        <b-form-group label-text-align="left" class="mb-0"
            v-for="(answer, key) in answers" :key="key">

            <b-form-select class="mb-3"
                v-model="answer.questionId"
                :options="options"></b-form-select>

            <fr-floating-label-input class="mb-3" type="text"
                v-if="answer.questionId === customIndex"
                v-model.trim="answer.customQuestion"
                :fieldName="$t('common.user.kba.question').toLowerCase() + key"
                :label="$t('common.user.kba.question')"
                :validateRules="{required: true, unique_question: getDuplicates(key)}"></fr-floating-label-input>

            <fr-floating-label-input class="mb-3" type="text"
                v-model.trim="answer.answer"
                :fieldName="$t('common.user.kba.answer').toLowerCase() + key"
                :label="$t('common.user.kba.answer')"
                :validateRules="'required'"></fr-floating-label-input>

            <hr v-if="key !== answers.length - 1">
        </b-form-group>
    </div>
</template>
<script>
import _ from 'lodash';
import FloatingLabelInput from '@/components/utils/FloatingLabelInput';

/**
 * @description Common selfservice component for defining security questions
 *
 **/
export default {
    name: 'KBA-Definition-Form-Group',
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
        'fr-floating-label-input': FloatingLabelInput
    },
    inject: ['$validator'],
    data () {
        let kba = this.selfServiceDetails.requirements.properties.kba,
            answers = _.times(kba.minItems, () => ({ answer: null, questionId: null, customQuestion: null })),
            customIndex = 'custom';

        return { kba, answers, customIndex };
    },
    computed: {
        predefinedQuestionOptions () {
            return _.map(this.kba.questions, (question) => {
                let value = question.id,
                    text = question.question[this.$i18n.locale] || question.question[this.$i18n.fallbackLocale],
                    disabled = !_.isUndefined(_.find(this.answers, { questionId: question.id }));

                return { value, text, disabled };
            });
        },
        predefinedQuestionText () {
            return this.predefinedQuestionOptions.map((question) => question.text);
        },
        options () {
            let placeholder = { value: null, text: this.$t('common.user.kba.selectQuestion'), disabled: true },
                customQuestionOption = { value: 'custom', text: this.$t('common.user.kba.custom'), disabled: false },
                tempOptions = [];

            tempOptions = tempOptions.concat(placeholder, this.predefinedQuestionOptions, customQuestionOption);

            return tempOptions;
        }
    },
    methods: {
        getData () {
            return {
                kba: this.answers.map((answer) => {
                    return _.omit(answer, answer.questionId === this.customIndex ? 'questionId' : 'customQuestion');
                })
            };
        },
        getDuplicates (key) {
            return _.clone(this.answers)
                .map((answer) => answer.customQuestion)
                .filter((question, index) => index !== key && question)
                .concat(this.predefinedQuestionText);
        },
        isValid () {
            /* istanbul ignore next */
            return this.$validator.validateAll();
        }
    },
    created () {
        /* istanbul ignore next */
        this.$validator.extend('unique_question', {
            getMessage: (field, exclusions) => this.$t('common.user.kba.notUnique'),
            validate: (value, exclusions) => {
                const trimToLower = (string) => _.trim(_.toLower(string));

                return !_.includes(_.map(exclusions, trimToLower), trimToLower(value));
            }
        });
    }
};
</script>
