<template>
    <b-nav-item-dropdown class="fr-notification-icon align-self-center mr-4" right>
        <template  slot="button-content">
            <i class="fa fa-bell mr-2"></i>
            <span v-if="notifications.length > 0" class="badge badge-pill badge-danger">{{notifications.length}}</span>
        </template>
        <b-dropdown-header class="border-bottom py-3">
            <div class="fr-notification-header">
                <span>{{$t('pages.app.notifications.title')}} ({{notifications.length}})</span>
                <a v-if="notifications.length > 0" @click.prevent="clearAll()" class="float-right" href="#">{{$t('pages.app.notifications.clearAll')}}</a>
            </div>
        </b-dropdown-header>

        <template v-if="notifications.length > 0">
            <div class="scrollbox" is="transition-group" name="notification-list">
                <div  v-for="(notification, index) in notifications" :class="[
                `${notification.notificationType}-notification`,
                { 'border-bottom': (index + 1) < notifications.length }, 'dropdown-item', 'py-3', 'fr-notification-item']" :key="notification._id">
                    <div class="media">
                        <div class="media-body">
                            <h6 class="my-0">{{notification.message}}</h6>
                            <small class="text-muted">{{notification.createDate | cleanDate}}</small>
                        </div>
                        <b-button @click.prevent="clearOne(index)" variant="sm" type="button" class="btn btn-link my-auto"><i class="fa fa-trash text-muted"></i></b-button>
                    </div>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="mt-4 mb-3 fr-no-notifications fr-notification-item">
                <div class="media">
                    <div class="media-body align-self-center">
                        <h6 class="text-center">{{$t('pages.app.notifications.noNotifications')}}</h6>
                    </div>
                </div>
            </div>
        </template>
    </b-nav-item-dropdown>
</template>

<script>
import _ from 'lodash';
import moment from 'moment';

/**
 * @description Display for system notifications for the logged in user
 *
 * notificationType supported:
 * danger
 * warning
 * success
 * info
 *
 * @fires GET /managed/resourceName/ID?_fields=_notifications/* - Retrieve all notifications for a specific resource
 * @fires DELETE /internal/notification - Remove one specific notification based on the notifications ID
 * @fires POST /notification?_action=deleteNotificationsForTarget&target=Id - Removes all notifications for a resource (e.g. managed/user/userID)
 *
 **/
export default {
    name: 'Toolbar-Notification',
    data () {
        return {
            notifications: [],
            timeoutId: null
        };
    },
    mounted () {
        this.loadData();
    },
    filters: {
        cleanDate (value) {
            return moment.utc(value).format('LLL') + ' UTC';
        }
    },
    methods: {
        resetPolling () {
            /* istanbul ignore next */
            if (!_.isNull(this.timeoutId)) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
            }
        },
        startPolling () {
            let pollingDelay = 3000;

            /* istanbul ignore next */
            this.timeoutId = _.delay(() => {
                this.loadData();
            }, pollingDelay);
        },
        clearAll () {
            this.notifications = [];

            let internalUser = this.$root.userStore.state.internalUser,
                target = internalUser ? 'internal/user/openidm-admin' : `${this.$root.userStore.state.managedResource}/${this.$root.userStore.state.userId}`;

            /* istanbul ignore next */
            this.resetPolling();

            /* istanbul ignore next */
            this.getRequestService()
                .post(`/notification?_action=deleteNotificationsForTarget&target=${target}`)
                .then(() => {
                    this.displayNotification('success', this.$t('pages.app.notifications.removedAll'));

                    if (_.isNull(this.timeoutId)) {
                        this.startPolling();
                    }
                })
                .catch(() => {
                    this.displayNotification('error', this.$t('pages.app.notifications.failedToClear'));
                });
        },
        clearOne (index) {
            let notificationId = this.notifications[index]._id;

            /* istanbul ignore next */
            this.resetPolling();

            this.notifications.splice(index, 1);
            /* istanbul ignore next */
            this.getRequestService()
                .delete(`/internal/notification/${notificationId}`)
                .then(() => {
                    this.displayNotification('success', this.$t('pages.app.notifications.removed'));

                    if (_.isNull(this.timeoutId)) {
                        this.startPolling();
                    }
                })
                .catch(() => {
                    this.displayNotification('error', this.$t('pages.app.notifications.failedToRemove'));
                });
        },
        loadData () {
            if (!_.isNull(this.$root.userStore.state.userId)) {
                this.getRequestService({ headers: { 'Cache-Control': 'no-store, no-cache' } })
                    .get(`/${this.$root.userStore.state.managedResource}/${this.$root.userStore.state.userId}?_fields=_notifications/*`)
                    .then(({ data }) => {
                        if (data._notifications) {
                            this.notifications = this.sortByDate(data._notifications);
                        } else {
                            this.notifications = [];
                        }

                        this.startPolling();
                    })
                    .catch(() => {});
            }
        },
        /**
         * Sorts input data by creation date, with newest at the top
         */
        sortByDate (data) {
            return _.sortBy(data, 'createDate').reverse();
        }
    }
};
</script>

<style lang="scss">
    .fr-notification-icon {
        .fr-notification-item {
            transition: opacity .5s;
            width: 275px;
            border-bottom: inherit;

            &.info-notification {
                border-left: solid 4px $primary;
            }

            &.success-notification {
                border-left: solid 4px $success;
            }

            &.danger-notification {
                border-left: solid 4px $danger;
            }

            &.warning-notification {
                border-left: solid 4px $warning;
            }

            &.fr-no-notifications {
                border-bottom: 0;
            }
        }

        .badge-danger {
            position: absolute;
            margin-left: -20px;
            vertical-align: super;
        }

        .dropdown-menu {
            right: auto;
            left: -165px;
            padding-bottom: 0;

            .scrollbox {
                max-height: 14.1875rem;
                overflow-y: auto;
            }
        }

        .dropdown-item {
            white-space: inherit
        }
    }

    @media (min-width: 768px) {
        .fr-notification-icon {
            .fr-notification-item {
                width: 325px;
            }

            .dropdown-menu {
                right: 0;
                left: auto;
            }
        }
    }

    // Animation
    .notification-list-enter, .notification-list-leave-to {
        opacity: 0;
    }
</style>
