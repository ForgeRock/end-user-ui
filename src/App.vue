<template>
    <div id="app">
        <div id="wrapper" :class="[{'toggled': toggled && !this.$route.meta.hideToolbar}]">
            <div id="appSidebarWrapper" v-if="!this.$route.meta.hideToolbar && this.$root.userStore.state.userId !== null">
                <ul class="sidebar-nav">
                    <li class="sidebar-brand">
                        <router-link class="d-flex" active-class=""  :to="{ name: 'Dashboard'}">
                            <img :src="require('@/assets/images/horizontal-logo-white.svg')" :alt="$t('common.form.logo')" style="width:131px;" class="align-self-center sidebar-brand-logo" />
                            <img :src="require('@/assets/images/vertical-logo-white.svg')" :alt="$t('common.form.logo')"  style="height:28px;" class="align-self-center sidebar-brand-mark" />
                        </router-link>
                    </li>
                    <li>
                        <router-link  :to="{ name: 'Dashboard'}"><i class="fa fa-fw mr-3 fa-tachometer-alt"></i><span class="sidebar-item-text">{{$t('pages.app.dashboard')}}</span></router-link>
                    </li>
                    <li>
                        <router-link :to="{ name: 'Profile'}"><i class="fa fa-fw mr-3 fa-street-view"></i><span class="sidebar-item-text">{{$t('pages.app.profile')}}</span></router-link>
                    </li>
                    <li v-if="$root.applicationStore.state.amDataEndpoints && this.$root.userStore.state.internalUser === false">
                        <router-link :to="{ name: 'Sharing'}"><i class="fa fa-fw mr-3 fa-share"></i><span class="sidebar-item-text">{{$t('pages.app.sharing')}}</span></router-link>
                    </li>
                    <template v-for="(access, index) in this.$root.userStore.state.access">
                        <li :key="'accessResource' +index">
                            <router-link :to="{ name: 'ListResource', meta: { title: 'User'}, params: { resourceType: access.privilegePath.split('/')[0],  resourceName: access.privilegePath.split('/')[1]}}"><i :class="accessIcon(access.icon)"></i><span class="sidebar-item-text">{{access.title}}</span></router-link>
                        </li>
                    </template>
                </ul>
            </div>
            <div id="appContentWrapper" :class="[{'fr-no-toolbar': this.$route.meta.hideToolbar}]">
                <!--
                Navigation Bar using Vue Route + Bootstrap Toolbar
                -->
                <b-navbar v-if="!this.$route.meta.hideToolbar && this.$root.userStore.state.userId !== null" class="fr-main-navbar">
                    <b-nav-form>
                        <b-button variant="link" class="my-2 my-sm-0 p-0 fr-main-nav-toggle" type="button" @click="onToggle">
                            <i class="fa fa-bars fa-lg m-0"></i>
                        </b-button>
                    </b-nav-form>
                    <b-navbar-brand class="ml-4" v-if="this.$route.params.resourceName">{{this.$route.params.resourceName | capitalize}}</b-navbar-brand>
                    <!-- Right aligned nav items -->
                    <b-navbar-nav class="ml-auto flex-row">
                        <fr-notification></fr-notification>
                        <b-nav-item-dropdown class="fr-main-dropdown" right>
                            <template slot="button-content">
                                {{$t('pages.app.user')}} <b-img :src="require('@/assets/images/profile-default.png')" rounded="circle" width="24" height="24" alt="img" class="m-1" />
                            </template>
                            <b-dropdown-item active-class="fr-no-active" exact-active-class="fr-no-active" :to="{ name: 'Profile'}">{{$t('pages.app.profile')}}</b-dropdown-item>
                            <b-dropdown-item v-if="this.$root.userStore.state.adminUser" href="/admin/">{{$t('pages.app.admin')}}</b-dropdown-item>
                            <b-dropdown-divider class="m-0"></b-dropdown-divider>
                            <b-dropdown-item @click.prevent="logoutUser()">{{$t('pages.app.signOut')}}</b-dropdown-item>
                        </b-nav-item-dropdown>
                    </b-navbar-nav>
                </b-navbar>
                <transition name="fade" mode="out-in">
                    <router-view :key="this.$route.fullPath"></router-view>
                </transition>
            </div>
        </div>
        <!--
          Application View
        -->
        <notifications group="IDMMessages" position="bottom left" width="320" :duration="4000">
            <template slot="body" slot-scope="props">
                <div :class="[{ 'alert-success': (props.item.type == 'success'), 'alert-warning': (props.item.type == 'warning'), 'alert-danger': (props.item.type == 'error'), 'alert-info': (props.item.type == 'info')}, 'alert', 'alert-dismissible', 'd-flex', 'p-3', 'pr-5', 'position-relative']" role="alert">
                    <div :class="[{ 'text-success': (props.item.type == 'success'), 'text-warning': (props.item.type == 'warning'), 'text-danger': (props.item.type == 'error'), 'text-info': (props.item.type == 'info')}, 'alert-icon', 'mr-3', 'align-self-top']">
                        <i :class="[{ 'fa-check-circle': (props.item.type == 'success'), 'fa-exclamation-triangle': (props.item.type == 'warning'), 'fa-times-circle': (props.item.type == 'error'), 'fa-info-circle': (props.item.type == 'info')}, 'fa', 'fa-lg']"></i>
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
    </div>
</template>

<script>
import ToolbarNotification from '@/components/utils/ToolbarNotification';
import _ from 'lodash';

export default {
    name: 'App',
    components: {
        'fr-notification': ToolbarNotification
    },
    data: function () {
        return {
            toggled: false
        };
    },
    methods: {
        onToggle () {
            this.toggled = !this.toggled;
        },
        accessIcon (icon) {
            let iconClass = 'fa fa-fw mr-3 ';

            if (icon.length) {
                iconClass = iconClass + icon;
            } else {
                iconClass = iconClass + 'fa-cube';
            }

            return iconClass;
        }
    },
    filters: {
        capitalize: function (value) {
            return _.capitalize(value);
        }
    }
};
</script>

<!--
  Main Application CSS

  lang="scss" to turn on LESS CSS
-->
<style lang="scss">
    // For theming please see https://getbootstrap.com/docs/4.0/getting-started/theming/
    // Variable must come before bootstrap (to override them)
    // Currently variable and theming loaded through node
    @import "~bootstrap/scss/bootstrap.scss";
    @import "scss/main.scss";
    @import "~bootstrap-vue/dist/bootstrap-vue.css";
    @import "~@fortawesome/fontawesome-free/css/all.css";

    #app {
        -webkit-transition: all 0.2s ease;
        -moz-transition: all 0.2s ease;
        -o-transition: all 0.2s ease;
        transition: all 0.2s ease;

        .container, .container-fluid {
            @media(min-width:768px) {
                padding-left: $grid-gutter-width;
                padding-right: $grid-gutter-width;
            }
        }

        .fr-main-dropdown {
            .dropdown-menu {
                padding-top: 0;
                padding-bottom: 0;
            }
        }

        #wrapper {
            height: 100%;

            #appSidebarWrapper {
                position: fixed;
                top: 0;
                width: 0;
                height: 100%;
                z-index: 2;
                margin-left: -$fr-sidebar-nav-width;
                overflow: hidden;
                background: $fr-sidebar-nav-background-color;

                -webkit-transition: all 0.2s ease;
                -moz-transition: all 0.2s ease;
                -o-transition: all 0.2s ease;
                transition: all 0.2s ease;

                a {
                    text-align: left;
                }

                .sidebar-brand-logo {
                    display: block;
                }

                .sidebar-brand-mark {
                    display: none;
                }

                @media(min-width:768px) {
                    width: $fr-sidebar-nav-minimized-width;
                    margin-left: 0;

                    .sidebar-brand-logo {
                        display: none;
                    }

                    .sidebar-brand-mark {
                        display: block;
                    }

                    .sidebar-item-text {
                        display: none;
                    }
                }
            }

            #appContentWrapper {
                height: 100%;
                -webkit-transition: all 0.2s ease;
                -moz-transition: all 0.2s ease;
                -o-transition: all 0.2s ease;
                transition: all 0.2s ease;
                padding-left: 0;

                @media(min-width:768px) {
                    padding-left: $fr-sidebar-nav-minimized-width;
                }

                &.fr-no-toolbar {
                    @media(min-width:768px) {
                        padding-left: 0;
                    }
                }

                .fr-main-nav-toggle {
                    color: $fr-toolbar-color;
                }

                .navbar-nav {
                    .dropdown-menu {
                        position: absolute;
                        float: left;
                    }

                    .nav-link {
                        color: $fr-toolbar-color;
                    }
                }
                >.container {
                    padding-top: $grid-gutter-width;
                    padding-bottom: $grid-gutter-width * 2;
                }
            }

            &.toggled {
                #appSidebarWrapper {
                    width: $fr-sidebar-nav-width;
                    margin-left: 0;

                    .sidebar-brand-logo {
                        display: block;
                    }

                    .sidebar-brand-mark {
                        display: none;
                    }

                    @media(min-width:768px) {
                        .sidebar-brand-logo {
                            display: block;
                        }

                        .sidebar-brand-mark {
                            display: none;
                        }

                        .sidebar-item-text {
                            display: inline;
                        }
                    }
                }

                #appContentWrapper {
                    z-index: 1;
                    padding-left: $fr-sidebar-nav-width;
                    margin-right: -$fr-sidebar-nav-width;

                    @media(min-width:768px) {
                        position: relative;
                        padding-left: $fr-sidebar-nav-width;
                        margin-right: 0;

                    }
                }
            }
        }

        /* Sidebar Styles */
        .sidebar-nav {
            position: absolute;
            top: 0;
            width: $fr-sidebar-nav-width;
            margin: 0;
            padding: 0;
            list-style: none;

            li {
                a {
                    color: $fr-sidebar-nav-link-color;
                    display: block;
                    border-left: 3px solid $fr-sidebar-nav-link-border-color;
                    text-decoration: none;
                    padding: 10px 20px 10px 17px;
                    -webkit-transition: all 0.2s ease;
                    -moz-transition: all 0.2s ease;
                    -o-transition: all 0.2s ease;
                    transition: all 0.2s ease;

                    &.router-link-active {
                        color: $fr-sidebar-nav-link-hover-color;
                        background: $fr-sidebar-nav-link-active-color;
                        border-left-color: $fr-sidebar-nav-link-active-border-color;
                    }

                    &:hover {
                        color: $fr-sidebar-nav-link-hover-color;
                        background: darken($fr-sidebar-nav-link-active-color,3.0%);
                    }
                }
            }

            >.sidebar-brand {
                height: $navbar-height;
                font-size: 18px;
                line-height: 72px;
                background-color: $fr-sidebar-nav-brand-color;
                width: 100%;
                top: 0;
                -webkit-transition: all 0.2s ease;
                -moz-transition: all 0.2s ease;
                -o-transition: all 0.2s ease;
                transition: all 0.2s ease;

                a {
                    color: $fr-sidebar-nav-link-color;
                    width: 100%;
                    height: 100%;
                    padding: 0 20px 0 17px;

                    &:hover {
                        color: $fr-sidebar-nav-link-hover-color;
                        background: $fr-sidebar-nav-background-color;
                    }
                }
            }
        }
    }

    .modal-open {
        #app {
            #wrapper {
                #appSidebarWrapper {
                    z-index: 0;
                }
            }
        }
    }
</style>
