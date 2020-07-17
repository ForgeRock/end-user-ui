<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

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
