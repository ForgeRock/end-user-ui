<template>
    <b-nav-item-dropdown class="fr-notification-icon align-self-center mr-4" right>
        <template  slot="button-content">
            <i class="fa fa-bell mr-2"></i>
            <span v-if="notifications.length > 0" class="badge badge-pill badge-danger">{{notifications.length}}</span>
        </template>
        <b-dropdown-header class="border-bottom py-3">
            <div class="fr-notification-header">
                <span>{{$t('pages.app.notifications.title')}} ({{notifications.length}})</span>
                <a v-if="notifications.length > 0" @click.prevent="clearAll()" class="pull-right" href="#">{{$t('pages.app.notifications.clearAll')}}</a>
            </div>
        </b-dropdown-header>

        <template v-if="notifications.length > 0">
            <div class="scrollbox" is="transition-group" name="notification-list">
                <div  v-for="(notification, index) in notifications" :class="[{ 'border-bottom': (index + 1) < notifications.length }, 'dropdown-item', 'py-3', 'fr-notification-item']" :key="notification._id">
                    <div class="media">
                        <div class="media-body align-self-center">
                            <h6 class="my-0">{{notification.message}}</h6>
                            <small class="text-muted">{{notification.createDate | cleanDate}}</small>
                        </div>
                        <div class="d-flex ml-3 align-self-center">
                            <b-button @click.prevent="clearOne(index)" variant="sm" type="button" class="btn btn-link"><i class="fa fa-trash text-muted"></i></b-button>
                        </div>
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
    import moment from 'moment';

    export default {
        name: 'Toolbar-Notification',
        data () {
            return {
                notifications: []
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
            clearAll () {
                this.notifications = [];

                /* istanbul ignore next */
                this.getRequestService()
                    .post(`/notification?_action=deleteNotificationsForReceiver&receiverId=${this.$root.userStore.state.userId}`)
                    .then(() => {
                        this.displayNotification('success', this.$t('pages.app.notifications.removedAll'));
                    });
            },
            clearOne (index) {
                /* istanbul ignore next */
                this.getRequestService()
                    .delete(`/notification/${this.notifications[index]._id}`)
                    .then(() => {
                        this.notifications.splice(index, 1);
                        this.displayNotification('success', this.$t('pages.app.notifications.removed'));
                    });
            },
            loadData () {
                /* istanbul ignore next */
                this.getRequestService()
                    .get(`/notification?_queryId=get-notifications-for-user&userId=${this.$root.userStore.state.userId}`)
                    .then(({data}) => {
                        this.notifications = data.result;
                    });
            }
        }
    };
</script>

<style lang="scss">
    .fr-notification-icon {
        .fr-notification-item {
            transition: opacity .5s;
            width: 275px;
        }

        .badge-danger {
            position: absolute;
            margin-left: -20px;
            vertical-align:super;
        }

        .dropdown-menu {
            right: auto;
            left: -165px;

            .scrollbox {
                max-height: 14.1875rem;
                overflow-y: scroll;
            }
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