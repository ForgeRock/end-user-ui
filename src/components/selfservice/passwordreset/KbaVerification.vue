<template>
    <b-form @keyup.enter="save" @submit.prevent>
        <p class='text-center mb-4'>
            {{$t(`pages.selfservice.passwordReset.kbaVerificationStageDescription`)}}
        </p>
        <div class="form-group text-left"
            v-for="(value, key) in answers"
            :key="key">
            <label class="col-form-label pt-0 pb-2" :for="key">{{questionText[key]}}</label>

            <input :ref="key" :key="key" v-validate="'required'" :data-vv-as="$t('common.user.kba.answer')" autofocus="true" :class="{'form-control': true, 'is-invalid': errors.has(key)}" :name="key" :id="key"  v-model.trim="answers[key]" />
            <fr-validation-error :validatorErrors="errors" :fieldName="key"></fr-validation-error>
        </div>

        <b-button @click="save" :block="true" size="lg" variant="primary">
            {{$tc('common.user.kba.submitAnswers', selfServiceDetails.requirements.required.length)}}
        </b-button>

    </b-form>
</template>

<script>
import _ from 'lodash';
import ValidationError from '@/components/utils/ValidationError';

/**
 * @description Selfservice stage for password reset, handles securing a users password change with verifying KBA answers
 *
 **/
export default {
    name: 'Kba-Verification',
    inject: ['$validator'],
    components: {
        'fr-validation-error': ValidationError
    },
    props: {
        selfServiceDetails: { required: true }
    },
    data () {
        let { locale, fallbackLocale } = this.$i18n,
            { properties, required } = this.selfServiceDetails.requirements;

        return {
            questionText: _.mapValues(properties, (value) => {
                if (_.has(value, 'systemQuestion')) {
                    let question = value.systemQuestion[locale] || value.systemQuestion[fallbackLocale];
                    return question;
                }

                if (_.has(value, 'userQuestion')) {
                    return value.userQuestion;
                }
            }),
            answers: required.reduce((acc, answer) => _.set(acc, answer, ''), {})
        };
    },
    mounted () {
        // This will auto focus as long as one answer field is generated
        if (this.$refs && this.$refs['answer1']) {
            this.$refs['answer1'][0].focus();
        }
    },
    methods: {
        emitData () {
            this.$emit('advanceStage', this.getData());
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
    }
};
</script>
