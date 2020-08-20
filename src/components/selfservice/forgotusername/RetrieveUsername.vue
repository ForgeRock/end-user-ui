<template>
    <div v-if="typeof selfServiceDetails.error !== 'string'">
        <b-alert variant="success" show>
            {{$t('pages.selfservice.forgotUsername.yourUsername')}} <b>{{selfServiceDetails.additions.userName}}</b>
        </b-alert>
    </div>
    <div v-else>
        <b-alert variant="danger" show>
            <b>{{$t('pages.selfservice.forgotUsername.unableToRetrieve')}}</b>
            <p>{{selfServiceDetails.error}}</p>
        </b-alert>
        <div class="mt-2">
            <b-link href="#/forgotUsername" @click="$router.go($router.currentRoute)">
                {{$t("pages.selfservice.forgotUsername.tryAgain")}}
            </b-link>
        </div>
    </div>
</template>

<script>
/**
 * @description Selfservice stage for username recovery, displays the found username
 *
 **/
export default {
    name: 'Retrieve-Username',
    props: {
        selfServiceDetails: { required: true }
    }
};
</script>
