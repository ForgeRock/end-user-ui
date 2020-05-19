<template>
    <b-form @keyup.enter="save" @submit.prevent>
        <p class="text-center mb-4">
            {{ $t(`pages.selfservice.passwordReset.kbaVerificationStageDescription`) }}
        </p>
        <div v-for="(value, key) in answers" :key="key" class="form-group text-left">
            <label class="col-form-label pt-0 pb-2" :for="key">{{ questionText[key] }}</label>

            <input
                :id="key"
                :ref="key"
                :key="key"
                v-model.trim="answers[key]"
                v-validate="'required'"
                :data-vv-as="$t('common.user.kba.answer')"
                autofocus="true"
                :class="{'form-control': true, 'is-invalid': errors.has(key)}"
                :name="key"
            >
            <fr-validation-error :validator-errors="errors" :field-name="key" />
        </div>

        <b-button :block="true" size="lg" variant="primary" @click="save">
            {{ $tc('common.user.kba.submitAnswers', selfServiceDetails.requirements.required.length) }}
        </b-button>
    </b-form>
</template>

<script>
import { has, mapValues, set } from "lodash";
import ValidationError from "../../utils/ValidationError";

/**
 * @description Selfservice stage for password reset, handles securing a users password change with verifying KBA answers
 *
 */
export default {
    "name": "Kba-Verification",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-validation-error": ValidationError
    },
    data () {
        const { locale, fallbackLocale } = this.$i18n,
            { properties, required } = this.selfServiceDetails.requirements;

        return {
            "answers": required.reduce((accumulator, answer) => set(accumulator, answer, ""), {}),
            "questionText": mapValues(properties, (value) => {
                if (has(value, "systemQuestion")) {
                    return value.systemQuestion[locale] || value.systemQuestion[fallbackLocale];
                }

                if (has(value, "userQuestion")) {
                    return value.userQuestion;
                }

                return null;
            })
        };
    },
    "inject": ["$validator"],
    "methods": {
        emitData () {
            this.$emit("advanceStage", this.getData());
        },
        getData () {
            return this.answers;
        },
        isValid () {
            /* istanbul ignore next */
            return this.$validator.validateAll();
        },
        save () {
            /* istanbul ignore next */
            this.isValid().then((valid) => {
                if (valid) {
                    this.emitData();
                }
            });
        }
    },
    mounted () {
        // This will auto focus as long as one answer field is generated
        if (this.$refs && this.$refs.answer1) {
            this.$refs.answer1[0].focus();
        }
    },
    "props": {
        "selfServiceDetails": { "required": true }
    }
};
</script>
