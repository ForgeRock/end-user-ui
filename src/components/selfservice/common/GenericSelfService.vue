<template>
    <div>
        <template v-for="(field, index) in displayDetails">
            <b-form-group :label="field.key | startCase" label-for="field.key" horizontal :key="'genericField' +index" v-if="(field.type === 'string' || field.type === 'number')">
                <b-form-input  :ref="index === 0 ? 'focusInput' : ''" v-if="field.type === 'string'"
                               :name="field.key"
                               :placeholder="field.text"
                               type="text"
                               :autocomplete="field.key"
                               v-model.trim="saveFields[field.key]"></b-form-input>

                <b-form-input horizontal :ref="index === 0 ? 'focusInput' : ''" v-if="field.type === 'number'"
                              :name="field.key"
                              type="number"
                              :autocomplete="field.key"
                              v-model.number="saveFields[field.key]"></b-form-input>
            </b-form-group>

            <!-- for boolean values -->
            <b-form-group :key="'genericField' +index" v-if="field.type === 'boolean'">
                <div class="form-row">
                    <label class="col-form-label col-sm-3" :for="field.key">{{field.key | startCase}}</label>
                    <div class="mr-auto">
                        <toggle-button class="mt-2 p-0 fr-toggle-primary"
                                       :height="28"
                                       :width="56"
                                       :sync="true"
                                       :cssColors="true"
                                       v-model="saveFields[field.key]"/>
                    </div>
                </div>
            </b-form-group>
        </template>
        <b-button @click="save" class='mt-4' :block="true" size="lg" variant="primary">
            {{$t("common.form.submit")}}
        </b-button>
    </div>
</template>

<script>
import _ from 'lodash';

/**
 * @description Selfservice stage for multiple selfservice flows, attempts to auto generate a form for a user to fill out. Currently
 * generates only numbers, strings and boolean fields. This stage will only load when no other stage is found.
 *
 **/
export default {
    name: 'Generic-Self-Service',
    props: {
        selfServiceDetails: { required: true }
    },
    data () {
        let saveData = {},
            displayDetails = [];

        if (this.selfServiceDetails && this.selfServiceDetails.requirements && this.selfServiceDetails.requirements.properties) {
            _.each(this.selfServiceDetails.requirements.properties, (prop, key) => {
                displayDetails.push({
                    type: prop.type,
                    text: prop.description,
                    key: key
                });

                if (prop.type === 'string') {
                    saveData[key] = '';
                } else if (prop.type === 'boolean') {
                    saveData[key] = false;
                } else {
                    saveData[key] = null;
                }
            });
        }

        return {
            saveFields: saveData,
            displayDetails: displayDetails
        };
    },
    methods: {
        getData () {
            return this.saveFields;
        },

        save () {
            this.$emit('advanceStage', this.getData());
        },

        isValid () {
            return Promise.resolve(true);
        }
    },
    filters: {
        startCase (value) {
            return _.startCase(value);
        }
    }
};
</script>

<style scoped></style>
