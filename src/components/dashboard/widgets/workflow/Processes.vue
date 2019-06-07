<template>
    <div>
        <fr-list-group :title="this.$t('pages.workflow.startProcess')">
            <template v-if="!isEmpty(processes)">
                <fr-list-item :collapsible="true" v-for="(process, id) in processes" :key="id" @hide="reset(id)" @show="$emit('loadProcess', process)">
                    <div slot="list-item-header" class="d-inline-flex w-100 media">
                        <div class="media-body align-self-center">
                            <h6>{{process.name}}</h6>
                        </div>
                        <div class="d-flex ml-3 align-self-center">
                            <div class="btn btn-sm btn-link float-right btn-cancel" :ref="`cancel-${id}`">{{$t('common.form.cancel')}}</div>
                            <div class="btn btn-sm btn-link float-right btn-edit">{{$t('pages.workflow.start')}}</div>
                        </div>
                    </div>

                    <div slot="list-item-collapse-body" class="d-inline-flex w-100">
                        <fr-process :processDefinition="process.processDefinition" :ref="id" @cancel="cancel" @startProcess="(payload) => $emit('startProcess', payload)"></fr-process>
                    </div>
                </fr-list-item>
            </template>
            <fr-list-item v-else>
                <div slot="list-item-header" class="text-muted text-center w-100">
                    {{$t('pages.workflow.noProcess')}}
                </div>
            </fr-list-item>
        </fr-list-group>
    </div>
</template>

<script>
import _ from 'lodash';
import styles from '@/scss/main.scss';
import ListGroup from '@/components/utils/ListGroup';
import ListItem from '@/components/utils/ListItem';
import Process from './Process';

/**
* @description Dashboard widget that displays a list of available processes that can be started
*
**/
export default {
    name: 'Processes',
    props: {
        'processes': {
            type: Object,
            default: () => {
                return {};
            }
        }
    },
    data () {
        return {
            loadingColor: styles.baseColor
        };
    },
    components: {
        'fr-list-group': ListGroup,
        'fr-list-item': ListItem,
        'fr-process': Process
    },
    methods: {
        isEmpty: _.isEmpty,
        reset (id) {
            let process = _.first(this.$refs[id]);

            if (process) {
                process.reset();
            }
        },
        cancel (id) {
            let cancelBtn = _.first(this.$refs[`cancel-${id}`]);

            if (cancelBtn) {
                this.reset(id);
                cancelBtn.click();
            }
        }
    }
};
</script>

<style lang="scss" scoped></style>
