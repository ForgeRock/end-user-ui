<template>
    <div class="form-label-group" ref="floatingLabelGroup">
        <input :type="type"
               :id="id"
               :class="[{'polyfillPlaceholder': floatLabels, 'is-invalid': errors.has(fieldName) }, 'form-control']"
               :autofocus="autofocus"
               v-model="inputValue"
               :placeholder="label"
               v-validate="validateRules"
               data-vv-validate-on="submit"
               :name="fieldName"/>

        <label :hidden="hideLabel" :for="id">{{ label }}</label>

        <fr-validation-error :validatorErrors="errors" :fieldName="fieldName"></fr-validation-error>
    </div>
</template>

<script>
    import _ from 'lodash';
    import ValidationError from '@/components/utils/ValidationError';

    export default {
        name: 'floating-label-input',
        components: {
            'fr-validation-error': ValidationError
        },
        props: ['label', 'type', 'autofocus', 'fieldName', 'validateRules'],
        inject: ['$validator'],
        data () {
            return {
                inputValue: '',
                id: null,
                floatLabels: false,
                hideLabel: true
            };
        },
        beforeMount: function () {
            this.id = 'floatingLabelInput' + this._uid;
        },
        mounted: function () {
            /* istanbul ignore next */
            _.delay(_.bind(() => {
                if (navigator.userAgent.indexOf('Edge') >= 0) {
                    if (document.getElementById(`${this.id}`).value.length) {
                        this.floatLabels = true;
                        this.inputValue = document.getElementById(`${this.id}`).value;
                    }
                } else if (navigator.userAgent.indexOf('Chrome') >= 0) {
                    if (document.querySelectorAll(`#${this.id}:-webkit-autofill`).length > 0) {
                        this.floatLabels = true;
                    }
                }
                this.hideLabel = false;
            }, this), 400);
        },
        watch: {
            inputValue: function (newVal) {
                this.floatLabels = newVal.length > 0;
                this.$emit('input', newVal);
            }
        }
    };
</script>

<style lang="scss" scoped>
    @import "../../scss/theme-variables.scss";
    .form-label-group {
        position: relative;
        margin-bottom: 1rem;
    }

    //-->
    // Bootstrap Floating Labels
    // https://getbootstrap.com/docs/4.0/examples/floating-labels/
    //-->
    .form-label-group > input,
    .form-label-group > label,
    .form-label-group > .input-group > input,
    .form-label-group > .input-group > label {
        padding: $input-btn-padding-x;
        text-align: left;
    }

    .form-label-group > label,
    .form-label-group > .input-group > label {
        position: absolute;
        top: 0;
        left: 0;
        display: block;
        width: 100%;
        margin-bottom: 0; /* Override default `<label>` margin */
        line-height: 1.5;
        color: $gray-700;
        border: 1px solid transparent;
        border-radius: .25rem;
        transition: all .1s ease-in-out;
    }

    .form-label-group input::-webkit-input-placeholder {
        color: transparent;
    }

    .form-label-group input:-ms-input-placeholder {
        color: transparent;
    }

    .form-label-group input:-ms-input-placeholder {
        color: transparent;
    }

    .form-label-group input::-moz-placeholder {
        color: transparent;
    }

    .form-label-group input::placeholder {
        color: transparent;
    }

    .form-label-group .polyfillPlaceholder {
        padding-top: $input-btn-padding-x + $input-btn-padding-x * (2 / 3);
        padding-bottom: $input-btn-padding-x / 3;
        color: black;
    }

    .form-label-group .polyfillPlaceholder ~ label {
        padding-top: $input-btn-padding-x / 3;
        padding-bottom: $input-btn-padding-x / 3;
        font-size: 12px;
        color: $gray-700;
    }
</style>