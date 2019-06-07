<template>
    <b-alert variant="success" show>
        {{$t('pages.selfservice.forgotUsername.emailSent')}}
    </b-alert>
</template>

<script>
/**
 * @description Selfservice stage for username recovery, displays a message notifying a user they have been sent an email
 *
 **/
export default {
    name: 'Email-Username'
};
</script>
