<template>
    <div class="mb-3">
        <div ref="floatingLabelGroup" :class="[{'form-label-password': reveal}, 'form-label-group', 'mb-0']">
            <input
                :id="id"
                ref="input"
                v-model="inputValue"
                v-validate="validateRules"
                :type="inputType"
                :class="[{'polyfillPlaceholder': floatLabels, 'is-invalid': errors.has(fieldName) && showErrorState }, 'form-control']"
                :autofocus="autofocus"
                :placeholder="label"
                :data-vv-as="label"
                data-vv-validate-on="submit"
                :name="fieldName"
            >
            <div v-if="reveal" class="input-group-append">
                <button class="btn btn-secondary" type="button" @click="revealText"><i :class="[{'fa-eye-slash': !show}, {'fa-eye': show}, 'fa']" /></button>
            </div>

            <label :hidden="hideLabel" :for="id">{{ label }}</label>
        </div>
        <slot name="validationError">
            <fr-validation-error :validator-errors="errors" :field-name="fieldName" />
        </slot>
    </div>
</template>

<script>
import { bind, delay } from "lodash";
import ValidationError from "./ValidationError";

/**
 * @description Input with a floating label in the center, this will move when a user types into the input (example can be found on the default login page)
 *
 */
export default {
    "name": "Floating-Label-Input",
    // eslint-disable-next-line sort-keys
    data () {
        return {
            "floatLabels": false,
            "hideLabel": true,
            "id": null,
            "inputType": this.type,
            "inputValue": "",
            "show": true
        };
    },
    // eslint-disable-next-line sort-keys
    beforeMount () {
        // eslint-disable-next-line no-underscore-dangle
        this.id = `floatingLabelInput${this._uid}`;
    },
    "components": {
        "fr-validation-error": ValidationError
    },
    "inject": ["$validator"],
    "methods": {
        revealText () {
            if (this.inputType === "password") {
                this.inputType = "text";
                this.show = false;
            } else {
                this.inputType = "password";
                this.show = true;
            }
        }
    },
    mounted () {
        /* istanbul ignore next */
        delay(bind(() => {
            if (navigator.userAgent.includes("Edge")) {
                // eslint-disable-next-line unicorn/prefer-query-selector
                if (document.getElementById(`${this.id}`).value.length > 0) {
                    this.floatLabels = true;
                    // eslint-disable-next-line unicorn/prefer-query-selector
                    this.inputValue = document.getElementById(`${this.id}`).value;
                }
            } else if (navigator.userAgent.includes("Chrome")) {
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
        if (this.autofocus === "true") {
            this.$refs.input.focus();
        }
    },
    "props": {
        "autofocus": String,
        "defaultValue": { "required": false },
        "fieldName": String,
        "label": String,
        "reveal": Boolean,
        "showErrorState": { "default": true, "type": Boolean },
        "type": String,
        "validateRules": [String, Object]
    },
    "watch": {
        inputValue (newValue) {
            this.floatLabels = newValue.length > 0;
            this.$emit("input", newValue);
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
