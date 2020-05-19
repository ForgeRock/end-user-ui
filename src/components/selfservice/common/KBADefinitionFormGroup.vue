<template>
    <div>
        <b-form-group v-for="(answer, key) in answers" :key="key" label-text-align="left" class="mb-0">
            <b-form-select v-model="answer.questionId" class="mb-3" :options="options" />

            <fr-floating-label-input
                v-if="answer.questionId === customIndex"
                v-model.trim="answer.customQuestion"
                class="mb-3"
                type="text"
                :field-name="$t('common.user.kba.question').toLowerCase() + key"
                :label="$t('common.user.kba.question')"
                :validate-rules="{required: true, unique_question: getDuplicates(key)}"
            />

            <fr-floating-label-input
                v-model.trim="answer.answer"
                class="mb-3"
                type="text"
                :field-name="$t('common.user.kba.answer').toLowerCase() + key"
                :label="$t('common.user.kba.answer')"
                :validate-rules="'required'"
            />

            <hr v-if="key !== answers.length - 1">
        </b-form-group>
    </div>
</template>
<script>
import { clone, find, map, includes, isUndefined, omit, times, toLower, trim } from "lodash";
import FloatingLabelInput from "../../utils/FloatingLabelInput";

/**
 * @description Common selfservice component for defining security questions
 *
 */
export default {
    "name": "KBA-Definition-Form-Group",
    // eslint-disable-next-line sort-keys
    "$_veeValidate": {
        "validator": "new"
    },
    "components": {
        "fr-floating-label-input": FloatingLabelInput
    },
    "computed": {
        options () {
            const customQuestionOption = { "disabled": false, "text": this.$t("common.user.kba.custom"), "value": "custom" },
                placeholder = { "disabled": true, "text": this.$t("common.user.kba.selectQuestion"), "value": null };
            let temporaryOptions = [];

            temporaryOptions = temporaryOptions.concat(placeholder, this.predefinedQuestionOptions, customQuestionOption);

            return temporaryOptions;
        },
        predefinedQuestionOptions () {
            return map(this.kba.questions, (question) => {
                const disabled = !isUndefined(find(this.answers, { "questionId": question.id })),
                    text = question.question[this.$i18n.locale] || question.question[this.$i18n.fallbackLocale],
                    value = question.id;

                return { disabled, text, value };
            });
        },
        predefinedQuestionText () {
            return this.predefinedQuestionOptions.map((question) => question.text);
        }
    },
    data () {
        const { kba } = this.selfServiceDetails.requirements.properties,
            // eslint-disable-next-line sort-vars
            answers = times(kba.minItems, () => ({ "answer": null, "customQuestion": null, "questionId": null })),
            customIndex = "custom";

        return { answers, customIndex, kba };
    },
    // eslint-disable-next-line sort-keys
    created () {
        /* istanbul ignore next */
        this.$validator.extend("unique_question", {
            "getMessage": (field, exclusions) => this.$t("common.user.kba.notUnique"),
            "validate": (value, exclusions) => {
                // eslint-disable-next-line unicorn/consistent-function-scoping
                const trimToLower = (string) => trim(toLower(string));

                return !includes(map(exclusions, trimToLower), trimToLower(value));
            }
        });
    },
    "inject": ["$validator"],
    "methods": {
        getData () {
            return {
                "kba": this.answers.map((answer) => omit(answer, answer.questionId === this.customIndex ? "questionId" : "customQuestion"))
            };
        },
        getDuplicates (key) {
            return clone(this.answers).
                map((answer) => answer.customQuestion).
                filter((question, index) => index !== key && question).
                concat(this.predefinedQuestionText);
        },
        isValid () {
            /* istanbul ignore next */
            return this.$validator.validateAll();
        }
    },
    "props": {
        "inline": {
            "default": false,
            "required": false
        },
        "selfServiceDetails": { "required": true }
    }
};
</script>
