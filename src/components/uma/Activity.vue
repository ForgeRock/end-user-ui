<template>
    <div>
        <template v-for="(activityGroup, index) in activityGroups">
            <fr-list-group :key="`activityGroup-${index}`">
                <div slot="list-group-header" class="card-body m-0 py-4">
                    <h6 class="card-title mb-0">{{ formatDateTitle(activityGroup.day) }}</h6>
                </div>
                <fr-list-item
                    v-for="activity in activityGroup.activities"
                    :key="activity._id"
                    :collapsible="false"
                    :panel-shown="false"
                    :hover-item="false"
                >
                    <template slot="list-item-header" class="d-inline-flex w-100">
                        <div class="flex-grow-1 media-body">
                            <span class="activity-type">{{ $t(`pages.uma.activity.${activity.type}`, {requestingParty: activity.requestingPartyName}) }}</span>
                            <button class="m-0 p-0 btn btn-link text-capitalize" type="button" @click="$emit('resourceSetClick', activity._id)">{{ activity.resourceSetName }}</button>
                            <small class="d-block text-muted subtext">{{ formatTime(activity.eventTime) }}</small>
                        </div>
                        <fr-fallback-image :src="activity.icon_uri" height="30" width="30" fallback="fa-file-alt" />
                    </template>
                </fr-list-item>
            </fr-list-group>
        </template>
    </div>
</template>

<script>
import { clone, groupBy, keys, sortBy } from "lodash";
import FallbackImage from "../utils/FallbackImage";
import ListGroup from "../utils/ListGroup";
import ListItem from "../utils/ListItem";
import moment from "moment";

/**
 * @description Main component for UMA (AM/IDM) displays a list of resource activities
 *
 */
export default {
    "name": "Uma-Activity",
    // eslint-disable-next-line sort-keys
    "components": {
        "fr-fallback-image": FallbackImage,
        "fr-list-group": ListGroup,
        "fr-list-item": ListItem
    },
    "computed": {
        activityGroups () {
            const temporaryUmaHistory = clone(this.umaHistory),
                // eslint-disable-next-line sort-vars, id-length
                sortedHistory = temporaryUmaHistory.sort((a, b) => a.eventTime - b.eventTime).reverse(),
                // eslint-disable-next-line sort-vars
                groups = groupBy(sortedHistory, (event) => moment(event.eventTime).format("YYYY-MM-DD")),
                // eslint-disable-next-line sort-vars
                activityGroups = keys(groups).map((day) => ({ "activities": groups[day], day }));

            return sortBy(activityGroups, ({ day }) => moment(day)).reverse();
        }
    },
    data () {
        return {};
    },
    "methods": {
        formatDateTitle (dateString) {
            return moment(dateString).format("dddd, MMMM DD, YYYY");
        },
        formatTime (dateString) {
            const eventDate = moment(dateString);

            if (eventDate.isSame(moment(), "day")) {
                return eventDate.fromNow();
            }
            return eventDate.format("LT");
        }
    },
    "props": {
        "umaHistory": {
            "required": true,
            "type": Array
        }
    }
};
</script>
