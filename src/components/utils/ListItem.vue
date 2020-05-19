<template>
    <div v-if="collapsible" class="collapsible">
        <b-list-group-item v-b-toggle="toggleId" href="#" :class="[{'list-item-cursor': collapsible===false}]">
            <div class="media">
                <slot name="list-item-header" />
            </div>
        </b-list-group-item>

        <b-collapse :id="id" :visible="panelShown" @hide="$emit('hide')" @show="$emit('show')" @hidden="$emit('hidden')" @shown="$emit('shown')">
            <b-card-body class="pt-3">
                <slot name="list-item-collapse-body" />
            </b-card-body>
        </b-collapse>
    </div>

    <div v-else :class="[{'fr-hover-item': hoverItem}]" @click="$emit('row-click')">
        <b-list-group-item class="noncollapse">
            <div class="media">
                <slot name="list-item-header" />
            </div>
        </b-list-group-item>

        <b-card-body v-if="panelShown" class="pt-3">
            <slot name="list-item-collapse-body" />
        </b-card-body>
    </div>
</template>

<script>

/**
 * @description Used in conjunction with ListGroup.vue, this is the individual item in each list display.
 *
 */
export default {
    "name": "List-Item",
    // eslint-disable-next-line sort-keys
    data () {
        return {
            "id": null
        };
    },
    // eslint-disable-next-line sort-keys
    beforeMount () {
        // eslint-disable-next-line no-underscore-dangle
        this.id = `listItem${this._uid}`;
    },
    "computed": {
        toggleId () {
            if (this.collapsible) {
                return this.id;
            }
            return null;
        }
    },
    "props": {
        "collapsible": {
            "default": false,
            "type": Boolean
        },
        "hoverItem": {
            "default": false,
            "type": Boolean
        },
        "panelShown": {
            "default": false,
            "type": Boolean
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
    .fr-hover-item {
        position: relative;

        &:hover {
            cursor: pointer;

            .list-group-item {
                background-color: $fr-hover-list-color;
            }
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
