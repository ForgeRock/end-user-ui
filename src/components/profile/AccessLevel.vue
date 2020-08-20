<template functional>
    <dl class="row">
        <dt class="col-xl-5 mb-3">{{parent.$t('pages.profile.consent.accountAccess')}}</dt>
        <dd class="col-xl-7 mb-4">
            <ul class="list-unstyled text-muted">
                <li class="py-1" v-for="field in props.fields" :key="field.name"><i class="fa fa-check fa-fw text-success mr-2"></i>{{field.title}}</li>
            </ul>
        </dd>
    </dl>
</template>
