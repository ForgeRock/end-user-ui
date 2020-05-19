<template>
    <div>
        <fr-list-group :title="this.$t('pages.workflow.startProcess')">
            <template v-if="!isEmpty(processes)">
                <fr-list-item v-for="(process, id) in processes" :key="id" :collapsible="true" @hide="reset(id)" @show="$emit('loadProcess', process)">
                    <div slot="list-item-header" class="d-inline-flex w-100 media">
                        <div class="media-body align-self-center">
                            <h6>{{ process.name }}</h6>
                        </div>
                        <div class="d-flex ml-3 align-self-center">
                            <div :ref="`cancel-${id}`" class="btn btn-sm btn-link float-right btn-cancel">{{ $t('common.form.cancel') }}</div>
                            <div class="btn btn-sm btn-link float-right btn-edit">{{ $t('pages.workflow.start') }}</div>
                        </div>
                    </div>

                    <div slot="list-item-collapse-body" class="d-inline-flex w-100">
                        <fr-process :ref="id" :process-definition="process.processDefinition" @cancel="cancel" @startProcess="(payload) => $emit('startProcess', payload)" />
                    </div>
                </fr-list-item>
            </template>
            <fr-list-item v-else>
                <div slot="list-item-header" class="text-muted text-center w-100">
                    {{ $t('pages.workflow.noProcess') }}
                </div>
            </fr-list-item>
        </fr-list-group>
    </div>
</template>

<script>
import { first, isEmpty } from "lodash";
import styles from "../../../../scss/main.scss";
import ListGroup from "../../../utils/ListGroup";
import ListItem from "../../../utils/ListItem";
import Process from "./Process";

/**
 * @description Dashboard widget that displays a list of available processes that can be started
 */
export default {
    "name": "Processes",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-list-group": ListGroup,
        "fr-list-item": ListItem,
        "fr-process": Process
    },
    data () {
        return {
            "loadingColor": styles.baseColor
        };
    },
    "methods": {
        cancel (id) {
            const cancelButton = first(this.$refs[`cancel-${id}`]);

            if (cancelButton) {
                this.reset(id);
                cancelButton.click();
            }
        },
        isEmpty,
        reset (id) {
            const process = first(this.$refs[id]);

            if (process) {
                process.reset();
            }
        }
    },
    "props": {
        "processes": {
            "default": () => ({}),
            "type": Object
        }
    }
};
</script>

<style lang="scss" scoped></style>
