<template>
    <div>
        <fr-list-group :title="this.$t('pages.workflow.startProcess')">
            <template v-if="!isEmpty(processes)">
                <fr-list-item :collapsible="true" v-for="(process, id) in processes" :key="id" @hide="reset(id)" @show="show(id)">
                    <div slot="list-item-header" class="d-inline-flex w-100 media">
                        <div class="media-body align-self-center">
                            <h6>{{process.name}}</h6>
                        </div>
                        <div class="d-flex ml-3 align-self-center">
                            <b-button v-if="panelShown[id] === true" variant="link" size="sm" :ref="`cancel-${id}`" class="btn-edit pb-2">{{ $t('common.form.cancel' )}}</b-button>
                            <b-button v-else variant="link" size="sm" class="btn-edit">{{ $t('common.form.edit' )}}</b-button>
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
    import ListGroup from '@/components/utils/ListGroup';
    import ListItem from '@/components/utils/ListItem';
    import styles from '@/scss/main.scss';
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
            let panelShown = {};

            return {
                panelShown,
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
            show (id) {
                this.$set(this.panelShown, id, true);
                this.$emit('loadProcess', this.processes[id]);
            },
            reset (id) {
                let process = _.first(this.$refs[id]);

                this.$set(this.panelShown, id, false);

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
        },
        watch: {
            processes (val, oldVal) {
                let newVals = _.difference(_.keys(val), _.keys(oldVal));

                _.forEach(newVals, (process, id) => {
                    this.panelShown[id] = false;
                });
            }
        }
    };
</script>

<style lang="scss" scoped></style>
