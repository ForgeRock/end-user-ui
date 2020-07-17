<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
    <ValidationObserver ref="observer" slim>
        <b-form @keyup.enter="save" @submit.prevent>
            <p class='text-center mb-4'>
                {{$t(`pages.selfservice.passwordReset.kbaVerificationStageDescription`)}}
            </p>
            <div class="form-group text-left"
                v-for="(value, key) in answers"
                :key="key">
                <ValidationProvider rules="required" :name="questionText[key]" :vid="key" v-slot="validationContext">
                    <label class="col-form-label pt-0 pb-2" :for="key">{{questionText[key]}}</label>

                    <b-form-input :ref="key" :key="key" :autofocus="true" :name="key" :id="key"  v-model.trim="answers[key]" />
                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                </ValidationProvider>
            </div>

            <b-button @click="save" :block="true" size="lg" variant="primary">
                {{$tc('common.user.kba.submitAnswers', selfServiceDetails.requirements.required.length)}}
            </b-button>

        </b-form>
    </ValidationObserver>
</template>

<script>
import _ from 'lodash';

/**
 * @description Selfservice stage for password reset, handles securing a users password change with verifying KBA answers
 *
 **/
export default {
    name: 'Kba-Verification',
    components: {},
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
    methods: {
        emitData () {
            this.$emit('advanceStage', this.getData());
        },
        getData () {
            return this.answers;
        },
        isValid () {
            /* istanbul ignore next */
            return this.$refs.observer.validate();
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
