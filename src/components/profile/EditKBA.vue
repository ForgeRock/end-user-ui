<template>
    <fr-list-item :collapsible="true" :panel-shown="false">
        <div slot="list-item-header" class="d-inline-flex w-100 media">
            <div class="media-body align-self-center">
                <h6 class="my-0">{{ $t('pages.profile.accountSecurity.securityQuestions') }}</h6>
            </div>
            <div class="d-flex ml-3 align-self-center">
                <div v-show="showCancelButton" ref="cancel" class="btn btn-sm btn-link float-right btn-cancel" @click="clearComponent()">{{ $t('common.form.cancel') }}</div>
                <div v-show="!showCancelButton" class="btn btn-sm btn-link float-right btn-edit" @click="showCancelButton = true">{{ $t('common.form.reset') }}</div>
            </div>
        </div>

        <div v-if="selected.length" slot="list-item-collapse-body" class="d-inline-flex w-100">
            <b-form class="w-100">
                <b-row>
                    <b-col sm="8">
                        <fieldset v-for="(select, id) in selected" :key="id" class="pb-3">
                            <label>{{ $t('common.user.kba.question') }} {{ select.index }}</label>
                            <b-form-select
                                v-model="select.selected"
                                class="mb-3"
                                :options="selectOptions"
                            />

                            <div v-if="select && select.selected === customIndex" class="pb-3">
                                <label>{{ $t('pages.profile.accountSecurity.custom') }}</label>
                                <b-form-input
                                    v-model.trim="select.custom"
                                    v-validate="'required'"
                                    type="text"
                                    data-vv-validate-on="submit"
                                    :name="$t('pages.profile.accountSecurity.custom') + select.index"
                                    :class="[{'is-invalid': errors.has($t('pages.profile.accountSecurity.custom') + select.index)}, 'form-control']"
                                />

                                <fr-validation-error :validator-errors="errors" :field-name="$t('pages.profile.accountSecurity.custom') + select.index" />
                            </div>

                            <div class="form-group mb-0">
                                <label>{{ $t('common.user.kba.answer') }}</label>
                                <b-form-input
                                    v-model.trim="select.answer"
                                    v-validate="'required'"
                                    type="text"
                                    class="form-control"
                                    data-vv-validate-on="submit"
                                    :data-vv-as="$t('common.user.kba.answer')"
                                    :name="$t('common.user.kba.answer') + select.index"
                                    :class="[{'is-invalid': errors.has($t('common.user.kba.answer') + select.index)}, 'form-control']"
                                />

                                <fr-validation-error :validator-errors="errors" :field-name="$t('common.user.kba.answer') + select.index" />
                            </div>

                            <hr v-if="id !== selected.length - 1" class="mb-3 mt-4">
                        </fieldset>

                        <fr-loading-button
                            type="button"
                            variant="primary"
                            class="ld-ext-right mb-3"
                            :label="$t('common.user.kba.saveQuestions')"
                            :loading="loading"
                            @click="onSaveKBA"
                        />
                    </b-col>
                </b-row>
            </b-form>
        </div>
    </fr-list-item>
</template>

<script>
import { each, includes, map, noop, times } from "lodash";
import ListItem from "../utils/ListItem";
import LoadingButton from "../utils/LoadingButton";
import ValidationError from "../utils/ValidationError";

/**
 * @description Allows a user to change their KBA, will ensure based on KBA configuration a user must match the systems KBA requirements.
 *
 */
export default {
    "name": "Edit-KBA",
    // eslint-disable-next-line sort-keys
    "$_veeValidate": {
        "validator": "new"
    },
    "components": {
        "fr-list-item": ListItem,
        "fr-loading-button": LoadingButton,
        "fr-validation-error": ValidationError
    },
    data () {
        return {
            "customIndex": null,
            "loading": false,
            "questions": {},
            "selectOptions": [],
            "selected": [],
            "showCancelButton": false
        };
    },
    "methods": {
        clearComponent () {
            this.loading = false;
            this.questions = {};
            this.selectOptions = [];
            this.selected = [];
            this.customIndex = null;
            this.showCancelButton = false;
            this.questions = this.kbaData.questions;
            this.initializeForm(this.kbaData.minimumAnswersToDefine);
            this.errors.clear();
        },

        generatePatch () {
            const values = map(this.selected, (field) => {
                if (field.custom) {
                    return {
                        "answer": field.answer,
                        "customQuestion": field.custom
                    };
                }
                return {
                    "answer": field.answer,
                    "questionId": field.selected
                };
            });

            return [{
                "field": "/kbaInfo",
                "operation": "replace",
                "value": values
            }];
        },

        initializeForm (minimumRequired) {
            const { locale, fallbackLocale } = this.$i18n;

            // Set form state based on stored user questions
            times(minimumRequired, (index) => {
                this.selected.push({ "answer": "", "custom": "", "index": index + 1, "selected": null });
            });

            // Create select options
            this.selectOptions = map(this.questions, (question, key) => ({ "disabled": true, "text": question[locale] || question[fallbackLocale], "value": key }));

            this.customIndex = this.selectOptions.length + 1;
            this.selectOptions.unshift({ "disabled": true, "text": this.$t("common.user.kba.selectQuestion"), "value": null });
            this.selectOptions.push({ "disabled": false, "text": this.$t("common.user.kba.custom"), "value": this.customIndex });
        },

        isValid () {
            /* istanbul ignore next */
            return this.$validator.validateAll();
        },

        onSaveKBA () {
            this.isValid().then((valid) => {
                if (valid) {
                    this.loading = true;

                    this.$emit("updateKBA", this.generatePatch(), { "onSuccess": () => {
                        this.$refs.cancel.click();
                    } });
                }
            });
        }
    },
    mounted () {
        this.questions = this.kbaData.questions;
        this.initializeForm(this.kbaData.minimumAnswersToDefine);
    },
    "props": ["kbaData"],
    "watch": {
        "kbaData": { "deep": true, "handler": noop },
        "selected": {
            "deep": true,
            handler (value) {
                // Create array of selected options that aren't custom
                const toDisable = map(this.selected, (selected) => {
                    if (selected.selected !== null && selected.selected !== this.customIndex) {
                        return selected.selected;
                    }
                    return null;
                });

                // Set any [toDisable] option to disabled
                each(this.selectOptions, (options) => {
                    if (includes(toDisable, options.value) || options.value === null) {
                        options.disabled = true;
                    } else {
                        options.disabled = false;
                    }
                });
            }
        }
    }
};
</script>
