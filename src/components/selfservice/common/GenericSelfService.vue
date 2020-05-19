<template>
    <div>
        <template v-for="(field, index) in displayDetails">
            <b-form-group v-if="(field.type === 'string' || field.type === 'number')" :key="'genericField' +index" :label="field.key | startCase" label-for="field.key" horizontal>
                <b-form-input
                    v-if="field.type === 'string'"
                    :ref="index === 0 ? 'focusInput' : ''"
                    v-model.trim="saveFields[field.key]"
                    :name="field.key"
                    :placeholder="field.text"
                    type="text"
                    :autocomplete="field.key"
                />

                <b-form-input
                    v-if="field.type === 'number'"
                    :ref="index === 0 ? 'focusInput' : ''"
                    v-model.number="saveFields[field.key]"
                    horizontal
                    :name="field.key"
                    type="number"
                    :autocomplete="field.key"
                />
            </b-form-group>

            <!-- for boolean values -->
            <b-form-group v-if="field.type === 'boolean'" :key="'genericField' +index">
                <div class="form-row">
                    <label class="col-form-label col-sm-3" :for="field.key">{{ field.key | startCase }}</label>
                    <div class="mr-auto">
                        <toggle-button
                            v-model="saveFields[field.key]"
                            class="mt-2 p-0 fr-toggle-primary"
                            :height="28"
                            :width="56"
                            :sync="true"
                            :css-colors="true"
                        />
                    </div>
                </div>
            </b-form-group>
        </template>
        <b-button class="mt-4" :block="true" size="lg" variant="primary" @click="save">
            {{ $t("common.form.submit") }}
        </b-button>
    </div>
</template>

<script>
import { each, startCase } from "lodash";

/**
 * @description Selfservice stage for multiple selfservice flows, attempts to auto generate a form for a user to fill out. Currently
 * generates only numbers, strings and boolean fields. This stage will only load when no other stage is found.
 *
 */
export default {
    "name": "Generic-Self-Service",
    // eslint-disable-next-line sort-keys
    data () {
        const displayDetails = [],
            saveData = {};

        if (this.selfServiceDetails && this.selfServiceDetails.requirements && this.selfServiceDetails.requirements.properties) {
            each(this.selfServiceDetails.requirements.properties, (prop, key) => {
                displayDetails.push({
                    key,
                    "text": prop.description,
                    "type": prop.type
                });

                if (prop.type === "string") {
                    saveData[key] = "";
                } else if (prop.type === "boolean") {
                    saveData[key] = false;
                } else {
                    saveData[key] = null;
                }
            });
        }

        return {
            displayDetails,
            "saveFields": saveData
        };
    },
    "filters": {
        startCase (value) {
            return startCase(value);
        }
    },
    "methods": {
        getData () {
            return this.saveFields;
        },
        isValid () {
            return Promise.resolve(true);
        },
        save () {
            this.$emit("advanceStage", this.getData());
        }
    },
    "props": {
        "selfServiceDetails": { "required": true }
    }
};
</script>

<style scoped></style>
