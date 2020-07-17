<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
    <div class="mb-3">
        <ValidationProvider :rules="validateRules" :vid="id" :name="label" v-slot="validationContext">
            <div :class="[{'form-label-password': reveal}, 'form-label-group', 'mb-0']" ref="floatingLabelGroup">
                <input :type="inputType"
                    :id="id"
                    :class="[{'polyfillPlaceholder': floatLabels, 'is-invalid': validationContext.errors.length > 0 && showErrorState }, 'form-control']"
                    :autofocus="autofocus"
                    v-model="inputValue"
                    :placeholder="label"
                    ref="input"
                    :name="fieldName"/>

                <div v-if="reveal" class="input-group-append">
                    <button @click="revealText" class="btn btn-secondary" type="button"><i :class="[{'fa-eye-slash': !show}, {'fa-eye': show}, 'fa']"></i></button>
                </div>

                <label :hidden="hideLabel" :for="id">{{ label }}</label>
            </div>
            <slot name="validationError">
                <p class="text-danger">{{ validationContext.errors[0] }}</p>
            </slot>
        </ValidationProvider>
    </div>
</template>

<script>
import _ from 'lodash';

/**
 * @description Input with a floating label in the center, this will move when a user types into the input (example can be found on the default login page)
 *
 **/
export default {
    name: 'Floating-Label-Input',
    components: {},
    props: {
        label: String,
        type: String,
        autofocus: String,
        fieldName: String,
        validateRules: {
            type: [String, Object]
        },
        reveal: Boolean,
        showErrorState: { type: Boolean, default: true },
        defaultValue: { required: false },
        value: {
            type: String,
            default () { return ''; }
        }
    },
    data () {
        return {
            inputValue: this.value,
            id: null,
            floatLabels: false,
            hideLabel: true,
            inputType: this.type,
            show: true
        };
    },
    beforeMount () {
        this.id = 'floatingLabelInput' + this._uid;
    },
    mounted () {
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

        if (this.defaultValue) {
            this.inputValue = this.defaultValue;
        }

        // Browser consistent focus fix
        if (this.autofocus === 'true') {
            this.$refs.input.focus();
        }
    },
    methods: {
        revealText: function () {
            if (this.inputType === 'password') {
                this.inputType = 'text';
                this.show = false;
            } else {
                this.inputType = 'password';
                this.show = true;
            }
        }
    },
    watch: {
        inputValue: function (newVal) {
            this.floatLabels = newVal.length > 0;
            this.$emit('input', newVal);
        },
        value: function () {
            this.inputValue = this.value;
        }
    }
};
</script>

<style lang="scss" scoped>
    .form-label-password.form-label-group {
        display: flex;

        .form-control {
            flex-grow: 1;
            border-bottom-right-radius: 0;
            border-top-right-radius: 0;
        }

        .input-group-append {
            flex-grow: 1;

            button {
                border-bottom-left-radius: 0;
                border-top-left-radius: 0;
                background-color: $input-bg;
                border-color: $input-border-color;
                color:$input-btn-color;
            }
            button:hover {
              color: $input-btn-active-color;
            }

        }
    }

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
        padding: $input-btn-padding-y;
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
        color: $label-color;
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
        padding-top: $input-btn-padding-y + $input-btn-padding-y * (2 / 3);
        padding-bottom: $input-btn-padding-y / 3;
        color: $input-color;
    }

    .form-label-group .polyfillPlaceholder ~ label {
        padding-top: $input-btn-padding-y / 3;
        padding-bottom: $input-btn-padding-y / 3;
        font-size: 12px;
        color: $label-color;
    }
</style>
