<!-- Copyright (c) 2023 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details. -->
<template>
  <div>
    <div class="code-editor position-relative" :class="{
      expanded: expanded,
      'error-state': !isValidJason
    }" @mouseover="hover = true" @mouseleave="hover = false">
      <VuePrismEditor language="json" v-model="stringifiedValue" :aria-label="$t('editor.accessibilityHelp')"
        :line-numbers="true" :readonly="readOnly" @input="validateCurrentJson($event.target.innerText)"
        @keydown="blurOnEscape" />
      <div class="d-flex justify-content-center w-100 position-absolute py-2 code-editor-expander pe-none">
        <button v-if="hover" class="btn btn-outline-secondary btn-sm pe-initial" @click.prevent="expanded = !expanded">
          <span v-if="expanded">
            {{ $t('pages.listTypesShared.collapse') }}
          </span>
          <span v-else>
            {{ $t('pages.listTypesShared.expand') }} ({{ lineCount }})
          </span>
        </button>
      </div>
    </div>
    <div>
      <p v-if="!isValidJason" class="text-danger">
        {{ $t('pages.listTypesShared.invalidJson') }}
      </p>
    </div>
  </div>
</template>
<script>
import VuePrismEditor from 'vue-prism-editor';
import 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';
import 'vue-prism-editor/dist/VuePrismEditor.css';
import blurOnEscape from '@/components/utils/codeEditor';

/**
 * JSON editor. Code editor used when data is too complex to edit with various inputs.
 */
export default {
    name: 'InlineJsonEditor',
    components: {
        VuePrismEditor
    },
    props: {
    /**
     * JSON value to edit
     */
        value: {
            type: Array,
            default: () => []
        },
        /**
     * Number of lines of JSON
     */
        lineCount: {
            type: Number,
            default: () => 1
        },
        /**
     * Disables editing
     */
        readOnly: {
            type: Boolean,
            default: () => true
        }
    },
    data () {
        return {
            hover: false,
            expanded: false,
            isValidJason: true
        };
    },
    computed: {
        stringifiedValue: {
            get () {
                if (this.value) {
                    return JSON.stringify(this.value, null, 2);
                }
                return '';
            },
            set (newValue) {
                return JSON.stringify(newValue, null, 2);
            }
        }
    },
    methods: {
        blurOnEscape,
        /**
     * Input handler. Validates JSON and enables save button accordingly.
     */
        validateCurrentJson (newValue) {
            try {
                const field = JSON.parse(newValue);
                this.isValidJason = true;
                this.$emit('disable-save-button', false);
                this.$emit('update-field', field);
            } catch (e) {
                this.isValidJason = false;
                this.$emit('disable-save-button', true);
            }
        }
    }
};
</script>
<style lang="scss" scoped>
.error-state {
  border: 1px solid $red;
}

.code-editor {
  transition: height 0.2s ease;
  height: 110px;
}

.code-editor-expander {
  bottom: 0;
  height: 45px;
}

.code-editor.expanded {
  height: auto;
}

.code-editor .code-editor-expander {
  background: linear-gradient(180deg, rgba(246, 248, 250, 0), $gray-100);
}

.pe-none {
  pointer-events: none;
}

.pe-initial {
  pointer-events: initial;
}
</style>
