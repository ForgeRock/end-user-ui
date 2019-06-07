<template>
    <div>
        <template v-for="(activityGroup, index) in activityGroups">
            <fr-list-group :key="`activityGroup-${index}`">
                <div class="card-body m-0 py-4" slot="list-group-header">
                    <h6 class="card-title mb-0">{{formatDateTitle(activityGroup.day)}}</h6>
                </div>
                <fr-list-item
                    v-for="activity in activityGroup.activities"
                    :key="activity._id"
                    :collapsible="false"
                    :panelShown="false"
                    :hoverItem="false">
                    <template slot="list-item-header" class="d-inline-flex w-100">
                        <div class="flex-grow-1 media-body">
                            <span class="activity-type">{{$t(`pages.uma.activity.${activity.type}`, {requestingParty: activity.requestingPartyName})}}</span>
                            <button class="m-0 p-0 btn btn-link text-capitalize" type="button" @click="$emit('resourceSetClick', activity._id)">{{activity.resourceSetName}}</button>
                            <small class="d-block text-muted subtext">{{formatTime(activity.eventTime)}}</small>
                        </div>
                        <fr-fallback-image :src="activity.icon_uri" height="30" width="30" fallback="fa-file-alt"></fr-fallback-image>
                    </template>
                </fr-list-item>
            </fr-list-group>
        </template>
    </div>
</template>

<script>
import _ from 'lodash';
import FallbackImage from '@/components/utils/FallbackImage';
import ListGroup from '@/components/utils/ListGroup';
import ListItem from '@/components/utils/ListItem';
import moment from 'moment';

/**
* @description Main component for UMA (AM/IDM) displays a list of resource activities
*
**/
export default {
    name: 'Uma-Activity',
    components: {
        'fr-list-group': ListGroup,
        'fr-list-item': ListItem,
        'fr-fallback-image': FallbackImage
    },
    props: {
        umaHistory: {
            required: true,
            type: Array
        }
    },
    data () {
        return {};
    },
    computed: {
        activityGroups () {
            let tempUmaHistory = _.clone(this.umaHistory),
                sortedHistory = tempUmaHistory.sort((a, b) => a.eventTime - b.eventTime).reverse(),
                groups = _.groupBy(sortedHistory, (event) => {
                    return moment(event.eventTime).format('YYYY-MM-DD');
                }),
                activityGroups = _.keys(groups).map((day) => {
                    return { day, activities: groups[day] };
                });

            return _.sortBy(activityGroups, ({ day }) => {
                return moment(day);
            }).reverse();
        }
    },
    methods: {
        formatDateTitle (dateString) {
            return moment(dateString).format('dddd, MMMM DD, YYYY');
        },
        formatTime (dateString) {
            let eventDate = moment(dateString);

            if (eventDate.isSame(moment(), 'day')) {
                return eventDate.fromNow();
            } else {
                return eventDate.format('LT');
            }
        }
    }
};
</script>
