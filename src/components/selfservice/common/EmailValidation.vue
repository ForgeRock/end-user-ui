<!--
Copyright (c) 2020 ForgeRock. All rights reserved.

This software may be modified and distributed under the terms
of the MIT license. See the LICENSE file for details.
-->

<template>
    <b-alert show>
        {{$t(`pages.selfservice.headers.${apiType}.emailSent`)}}
    </b-alert>
</template>

<script>
/**
 * @description Selfservice stage for multiple selfservice flows, displays a email sent message
 *
 **/
export default {
    name: 'Email-Validation',
    props: {
        apiType: { required: true }
    }
};
</script>
