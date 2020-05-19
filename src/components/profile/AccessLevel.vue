<template functional>
    <dl class="row">
        <dt class="col-xl-5 mb-3">{{ parent.$t('pages.profile.consent.accountAccess') }}</dt>
        <dd class="col-xl-7 mb-4">
            <ul class="list-unstyled text-muted">
                <li v-for="field in props.fields" :key="field.name" class="py-1"><i class="fa fa-check fa-fw text-success mr-2" />{{ field.title }}</li>
            </ul>
        </dd>
    </dl>
</template>
