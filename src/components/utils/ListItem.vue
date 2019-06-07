<template>
    <div v-if="collapsible" class="collapsible">
        <b-list-group-item href="#" :class="[{'list-item-cursor': collapsible===false}]" v-b-toggle="toggleId">
            <div class="media">
                <slot name="list-item-header"></slot>
            </div>
        </b-list-group-item>

        <b-collapse :id="id" :visible="panelShown" @hide="$emit('hide')" @show="$emit('show')" @hidden="$emit('hidden')" @shown="$emit('shown')">
            <b-card-body class="pt-3">
                <slot name="list-item-collapse-body"></slot>
            </b-card-body>
        </b-collapse>
    </div>

    <div v-else @click="$emit('row-click')" :class="[{'fr-hover-item': hoverItem}]">
        <b-list-group-item class="noncollapse">
            <div class="media">
                <slot name="list-item-header"></slot>
            </div>
        </b-list-group-item>

        <b-card-body v-if="panelShown" class="pt-3">
            <slot name="list-item-collapse-body"></slot>
        </b-card-body>
    </div>
</template>

<script>
/**
 * @description Used in conjunction with ListGroup.vue, this is the individual item in each list display.
 *
 **/
export default {
    name: 'List-Item',
    props: {
        'collapsible': {
            type: Boolean,
            default: false
        },
        'panelShown': {
            type: Boolean,
            default: false
        },
        'hoverItem': {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            id: null
        };
    },
    beforeMount () {
        this.id = 'listItem' + this._uid;
    },
    computed: {
        toggleId () {
            if (this.collapsible) {
                return this.id;
            } else {
                return null;
            }
        }
    }
};
</script>
<style lang="scss" scoped>
    .media {
        height: 38px;

        & > * {
            -ms-flex-item-align: center;
            align-self: center;
        }
    }

    .list-item-cursor {
        cursor: default;
    }

    .fr-hover-item:hover {
        cursor: pointer;

        .list-group-item {
            background-color: $fr-hover-list-color;
        }
    }

    .collapsible:last-of-type > .list-group-item.collapsed {
        border-bottom-right-radius: $border-radius;
        border-bottom-left-radius: $border-radius;
        border-bottom: 1px solid $border-color;
    }

    .list-group-item-action {
        color: inherit;

        .caret {
            .caret-up {
                display: none;
            }
        }
        .meta {
            line-height: 1.2;
        }
        .btn-cancel {
            display: none;
        }
        .btn-edit {
            display: block;
        }

        &:not(.collapsed) {
            button {
                display: block;
            }
            .btn-cancel {
                display: block;
            }
            .btn-edit {
                display: none;
            }
            .caret {
                .caret-up {
                    display: block;
                }
                .caret-down {
                    display: none;
                }
            }
        }
    }

    .list-group-item-action:not(.collapsed),
    .list-group-item-action:not(.collapsed):hover,
    .list-group-item-action:not(.collapsed):focus,
    .noncollapse {
        background-color: $card-bg;
        border-bottom-color: transparent;
        cursor: initial;
    }

</style>
