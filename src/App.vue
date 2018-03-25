<template>
    <div class="fr-background" id="app">
        <!--
        Navigation Bar useing Vue Route + Bootstrap Toolbar
        -->
        <b-navbar v-if="!this.$route.meta.hideToolbar" toggleable="md" type="dark" variant="dark">
            <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
            <b-navbar-brand to="/"><img src="static/image/forgerock.png" alt="Forgerock" /></b-navbar-brand>
        </b-navbar>
        <!--
          Application View
        -->
        <notifications group="IDMMessages" style="width: 500px; top: 15px; left: 15px;">
            <template slot="body" slot-scope="props">
                <div :class="[{ 'alert-success': (props.item.type == 'success'), 'alert-warning': (props.item.type == 'warning'), 'alert-danger': (props.item.type == 'error'), 'alert-info': (props.item.type == 'info')}, 'alert', 'alert-dismissible']" role="alert">
                <div class="alert-icon pull-left" style="width: 50px;">
                    <i :class="[{ 'fa-check-circle-o': (props.item.type == 'success'), 'fa-warning': (props.item.type == 'warning'), 'fa-times-circle-o': (props.item.type == 'error'), 'fa-info-circle ': (props.item.type == 'info')}, 'fa']"></i>
                </div>
                <div class="fr-alert-content">
                    <h4 class="alert-heading">{{props.item.title}}</h4>
                    <p v-html="props.item.text"></p>
                </div>
                <a class="close" @click="props.close">
                    <i class="fa fa-fw fa-close"></i>
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
<style lang="scss">
    @import 'scss/main';
</style>
