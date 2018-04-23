<template>
    <div>
        <div v-if="collapsible">
            <b-list-group-item href="#" :class="[{'list-item-cursor': collapsible===false}]" v-b-toggle="toggleId">
                <div class="media">
                    <slot name="list-item-header"></slot>
                </div>
            </b-list-group-item>

            <b-collapse :id="id" :visible="panelShown">
                <b-card-body class="pt-3">
                    <slot name="list-item-collapse-body"></slot>
                </b-card-body>
            </b-collapse>
        </div>

        <div v-else>
            <b-card-header>
                <slot name="list-item-header"></slot>
            </b-card-header>

            <b-card-body v-if="panelShown" class="pt-3">
                <slot name="list-item-collapse-body"></slot>
            </b-card-body>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'list-group',
        props: {
            'collapsible': {
                type: Boolean,
                default: false
            },
            'panelShown': {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                id: null
            };
        },
        beforeMount: function () {
            this.id = 'listItem' + this._uid;
        },
        computed: {
            toggleId () {
                if (this.collapsible) {
                    return this.id;
                }
            }
        }
    };
</script>
// TODO:  These styles need worked on for the 4 uses cases possible above.
<style lang="scss" scoped>
    @import "../../scss/theme-variables.scss";
    .list-item-cursor {
        cursor: default;
    }
    // List group
    .list-group-item {
        //padding-right: 74px;
    }
    .list-group-item h5,
    .list-group-item h6 {

    }
    .list-group-item,
    .list-group-item-action h5,
    .list-group-item h6,
    .list-group-item-action .caret:after {

    }

    .card .list-group > :not(.collapse):last-of-type {
        border-bottom-right-radius: $border-radius;
        border-bottom-left-radius: $border-radius;
    }

    .list-group-item-action:not(.collapsed),
    .list-group-item-action:not(.collapsed):hover,
    .list-group-item-action:not(.collapsed):focus {
        background-color: #fff;
        border-bottom-color: transparent;
    }
    .list-group-item-action .caret .caret-up {
        display: none;
    }
    .list-group-item-action:not(.collapsed) .caret .caret-up {
        display: block;
    }
    .list-group-item-action .caret .caret-down {
        display: block;
    }
    .list-group-item-action:not(.collapsed) .caret .caret-down {
        display: none;
    }
    .list-group-item-action button {

    }
    .list-group-item-action:not(.collapsed) button {
        display: block;
    }
    .list-group-item .meta {
        line-height: 1.2;
    }
    .list-group .collapse .card-header {
    }
    .list-group-item-action .btn-cancel {
        display: none;
    }
    .list-group-item-action:not(.collapsed) .btn-cancel {
        display: block;
    }
    .list-group-item-action .btn-edit {
        display: block;
    }
    .list-group-item-action:not(.collapsed) .btn-edit {
        display: none;
    }
</style>
