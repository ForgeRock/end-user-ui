<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<script>
import {
    capitalize,
    keys,
    lowerCase
} from 'lodash';

/**
 * @description Mixin for sharing common methods and computed properties between lists components
 */
export default {
    name: 'ListsMixin',
    methods: {
        isValidJSONString (str) {
            try {
                JSON.parse(JSON.stringify(str, null, 2));
            } catch (e) {
                return false;
            }
            return true;
        },
        validateCurrentJson () {
            try {
                const field = JSON.parse(this.currentJson);
                this.isValidJason = true;
                this.$emit('disable-save-button', false);
                this.$emit('update-field', field);
            } catch (e) {
                this.isValidJason = false;
                this.$emit('disable-save-button', true);
            }
        },
        getValueBasedOnType (obj) {
            if (obj.type === 'boolean') {
                return false;
            }
            if (obj.type === 'number') {
                return 0;
            }
            if (obj.type === 'array' && obj.items.type !== 'array' && obj.items.type !== 'object') {
                return [];
            }
            if (obj.type === 'array') {
                return [this.getValueBasedOnType(obj.items)];
            }
            if (obj.type === 'object') {
                return this.createObject(obj.properties);
            }

            return '';
        },
        // build object from schema
        createObject (properties) {
            // creates object with appropriate keys
            return keys(properties).reduce((accum, current) => {
                accum[current] = this.getValueBasedOnType(properties[current]);
                return accum;
            }, {});
        }
    },
    computed: {
        lineCount () {
            if (this.value) {
                return this.stringifiedValue.split(/\r\n|\r|\n/).length;
            }
            return 1;
        },
        stringifiedValue: {
            get () {
                if (this.value) {
                    return JSON.stringify(this.value, null, 4);
                }
                return '';
            },
            set (newValue) {
                return JSON.stringify(newValue, null, 4);
            }
        },
        capitalizedDescription () {
            if (this.description) {
                return capitalize(this.description);
            } if (this.label) {
                return capitalize(this.label);
            }
            return capitalize(lowerCase(this.name));
        },
        readOnly () {
            return this.expanded === false;
        }
    }
};
</script>
