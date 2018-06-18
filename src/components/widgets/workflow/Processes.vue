<template>
    <div>
        <fr-list-group :title="this.$t('pages.workflow.startProcess')">
            <template v-if="processes.length > 0">
                <fr-list-item :collapsible="true" v-for="(process, index) in processes" :key="process.key">
                    <div slot="list-item-header" @click="loadProcess(index)" class="d-inline-flex w-100 media">
                        <div class="media-body align-self-center">
                            <h6>{{process.name}}</h6>
                        </div>
                        <div class="d-flex ml-3 align-self-center">
                            <div class="btn btn-sm btn-link float-right btn-cancel" ref="cancel">{{$t('common.form.cancel')}}</div>
                            <div class="btn btn-sm btn-link float-right btn-edit">{{$t('pages.workflow.start')}}</div>
                        </div>
                    </div>

                    <div slot="list-item-collapse-body" class="d-inline-flex w-100">
                        <div v-if="loadData[index-1] !== null">
                            Load Process
                        </div>
                        <div class="h-100 d-flex"  v-else>
                            <div class="m-auto fr-center-card">
                                <bounce-loader :color="loadingColor"></bounce-loader>
                            </div>
                        </div>
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
    import { BounceLoader } from 'vue-spinner/dist/vue-spinner.min.js';

    export default {
        name: 'Processes',
        props: {
            'processes': {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data () {
            return {
                loadData: [],
                loadingColor: styles.baseColor
            };
        },
        components: {
            'fr-list-group': ListGroup,
            'fr-list-item': ListItem,
            BounceLoader
        },
        watch: {
            processes (newVal) {
                this.loadData = [];

                _.each(newVal, (item) => {
                    if (!_.isEmpty(item)) {
                        this.loadData.push(null);
                    }
                });
            }
        },
        methods: {
            loadProcess (index) {
                if (_.isNull(this.loadData[index])) {
                    let idmInstance = this.getRequestService();

                    // prevent multiple clicks triggering multiple loads
                    // this.loadData[index] = {};

                    idmInstance.get(`/workflow/processdefinition/${this.processes[index]._id}`).then((processInfo) => {
                        // TODO Complete loading and completion of the form
                        console.log(processInfo);
                    });
                }
            }
        }
    };
</script>

<style lang="scss" scoped></style>