<template>
    <div id="app">
        <!--
        Navigation Bar useing Vue Route + Bootstrap Toolbar
        -->
        <b-navbar v-if="!this.$route.meta.hideToolbar" toggleable="md" class="fr-main-navbar">
            <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
            <b-navbar-brand to="/"><img src="static/image/horizontal-logo.svg" alt="$t('common.form.logo')" /></b-navbar-brand>
        </b-navbar>
        <!--
          Application View
        -->
        <notifications group="IDMMessages" position="bottom left" width="320" :duration="4000">
            <template slot="body" slot-scope="props">
                <div :class="[{ 'alert-success': (props.item.type == 'success'), 'alert-warning': (props.item.type == 'warning'), 'alert-danger': (props.item.type == 'error'), 'alert-info': (props.item.type == 'info')}, 'alert', 'alert-dismissible', 'd-flex', 'p-3', 'pr-5', 'position-relative']" role="alert">
                    <div :class="[{ 'text-success': (props.item.type == 'success'), 'text-warning': (props.item.type == 'warning'), 'text-danger': (props.item.type == 'error'), 'text-info': (props.item.type == 'info')}, 'alert-icon', 'mr-3', 'align-self-top']">
                        <i :class="[{ 'fa-check-circle-o': (props.item.type == 'success'), 'fa-exclamation-triangle': (props.item.type == 'warning'), 'fa-times-circle': (props.item.type == 'error'), 'fa-info-circle ': (props.item.type == 'info')}, 'fa', 'fa-lg']"></i>
                    </div>
                    <div class="fr-alert-content align-self-center">
                        <p class="mb-0 text-left" v-html="props.item.text"></p>
                    </div>
                    <a class="close" @click="props.close">
                        <i class="fa fa-times"></i>
                    </a>
                </div>
            </template>
        </notifications>

        <transition name="fade" mode="out-in">
            <router-view/>
        </transition>
    </div>
</template>

<script>
    export default {
        name: 'app'
    };
</script>

<!--
  Main Application CSS

  lang="scss" to turn on LESS CSS
-->
<style lang="scss"></style>
