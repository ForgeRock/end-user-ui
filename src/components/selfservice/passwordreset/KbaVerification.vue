<template>
    <b-form @keyup.enter="save" @submit.prevent>
        <p class='text-center mb-4'>
            {{$t(`pages.selfservice.passwordReset.kbaVerificationStageDescription`)}}
        </p>
        <div class="form-group text-left"
            v-for="(value, key) in answers"
            :key="key">
            <label class="col-form-label pt-0 pb-2" :for="key">{{questionText[key]}}</label>

            <input :key="key" v-validate="'required'" :data-vv-as="$t('common.user.kba.answer')" autofocus="true" :class="{'form-control': true, 'is-invalid': errors.has(key)}" :name="key" :id="key"  v-model.trim="answers[key]" />
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
            let locale = this.$i18n.locale,
                { properties, required } = this.selfServiceDetails.requirements;

            return {
                questionText: _.mapValues(properties, (value) => {
                    if (_.has(value, 'userQuestion')) return value.userQuestion;
                    if (_.has(value, 'systemQuestion')) return value.systemQuestion[locale];
                }),
                answers: required.reduce((acc, answer) => _.set(acc, answer, ''), {})
            };
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
