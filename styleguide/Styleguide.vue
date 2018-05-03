<template>
    <b-container>
        <template>
            <b-container>
                <template>
                    <section class="my-5">
                        <b-row>
                            <b-col sm="3">
                              <h2 class="">Grays</h2>
                            </b-col>
                            <b-col sm="9">
                                <div class="p-3 mb-2 bg-gray-100">gray-100</div>
                                <div class="p-3 mb-2 bg-gray-200">gray-200</div>
                                <div class="p-3 mb-2 bg-gray-300">gray-300</div>
                                <div class="p-3 mb-2 bg-gray-400">gray-400</div>
                                <div class="p-3 mb-2 bg-gray-500 text-white">gray-500</div>
                                <div class="p-3 mb-2 bg-gray-600 text-white">gray-600</div>
                                <div class="p-3 mb-2 bg-gray-700 text-white">gray-700</div>
                                <div class="p-3 mb-2 bg-gray-800 text-white">gray-800</div>
                                <div class="p-3 mb-2 bg-gray-900 text-white">gray-900</div>
                          </b-col>
                        </b-row>
                    </section>
                    <section class="my-5">
                        <b-row>
                            <b-col sm="3">
                              <h2 class="">Colors</h2>
                            </b-col>
                            <b-col sm="9">
                                <div class="p-3 mb-2 bg-blue text-white">blue</div>
                                <div class="p-3 mb-2 bg-indigo text-white">indigo</div>
                                <div class="p-3 mb-2 bg-purple text-white">purple</div>
                                <div class="p-3 mb-2 bg-pink text-white">pink</div>
                                <div class="p-3 mb-2 bg-red text-white">red</div>
                                <div class="p-3 mb-2 bg-orange text-white">orange</div>
                                <div class="p-3 mb-2 bg-yellow text-white">yellow</div>
                                <div class="p-3 mb-2 bg-green text-white">green</div>
                                <div class="p-3 mb-2 bg-teal text-white">teal</div>
                                <div class="p-3 mb-2 bg-cyan text-white">cyan</div>
                          </b-col>
                        </b-row>
                    </section>

                    <section class="my-5">
                        <b-row>
                            <b-col sm="3">
                              <h2 class="">Classes</h2>
                            </b-col>
                            <b-col sm="9">
                                  <div class="p-3 mb-2 bg-primary text-white">.bg-primary</div>
                                  <div class="p-3 mb-2 bg-secondary text-white">.bg-secondary</div>
                                  <div class="p-3 mb-2 bg-success text-white">.bg-success</div>
                                  <div class="p-3 mb-2 bg-danger text-white">.bg-danger</div>
                                  <div class="p-3 mb-2 bg-warning text-dark">.bg-warning</div>
                                  <div class="p-3 mb-2 bg-info text-white">.bg-info</div>
                                  <div class="p-3 mb-2 bg-light text-dark">.bg-light</div>
                                  <div class="p-3 mb-2 bg-dark text-white">.bg-dark</div>
                                  <div class="p-3 mb-2 bg-white text-dark">.bg-white</div>

                                  <div class="mt-4">
                                    <p class="text-primary">.text-primary</p>
                                    <p class="text-secondary">.text-secondary</p>
                                    <p class="text-success">.text-success</p>
                                    <p class="text-danger">.text-danger</p>
                                    <p class="text-warning">.text-warning</p>
                                    <p class="text-info">.text-info</p>
                                    <p class="text-light bg-dark">.text-light</p>
                                    <p class="text-dark">.text-dark</p>
                                    <p class="text-muted">.text-muted</p>
                                    <p class="text-white bg-dark">.text-white</p>
                                  </div>

                          </b-col>
                        </b-row>
                    </section>

                    <section class="my-5">
                        <b-row>
                            <b-col sm="3">
                              <h2 class="">Typography</h2>
                            </b-col>
                            <b-col sm="9">
                                <h1>h1. Header</h1>
                                <h2>h2. Header</h2>
                                <h3>h3. Header</h3>
                                <h4>h4. Header</h4>
                                <h5>h5. Header</h5>
                                <h6>h6. Header</h6>

                                <div class="mt-4">
                                  <p>Body text lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede.</p>
                                  <p>Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis.</p>
                                  <p>Morbi in sem quis dui placerat ornare. Pellentesque odio nisi, euismod in, pharetra a, ultricies in, diam. Sed arcu. Cras consequat.</p>
                                  <p>Praesent dapibus, neque id cursus faucibus, tortor neque egestas auguae, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.</p>
                                  <p>Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi.</p>
                                </div>


                          </b-col>
                        </b-row>
                    </section>
                </template>
            </b-container>
        </template>
    </b-container>
</template>

<script>
    export default {
        name: 'Styleguide',
        data: function () {
            return {};
        },
        components: {},
        mounted () {},
        methods: {}
    };
</script>
<style lang="scss">
    .bg-white {
        background-color: $white;
    }
    .bg-gray-100 {
        background-color: $gray-100;
    }
    .bg-gray-200 {
        background-color: $gray-200;
    }
    .bg-gray-300 {
        background-color: $gray-300;
    }
    .bg-gray-400 {
        background-color: $gray-400;
    }
    .bg-gray-500 {
        background-color: $gray-500;
    }
    .bg-gray-600 {
        background-color: $gray-600;
    }
    .bg-gray-700 {
        background-color: $gray-700;
    }
    .bg-gray-800 {
        background-color: $gray-800;
    }
    .bg-gray-900 {
        background-color: $gray-900;
    }
    .black {
        background-color: $black;
    }

    .bg-blue {
        background-color: $blue;
    }
    .bg-indigo {
        background-color: $indigo;
    }
    .bg-purple {
        background-color: $purple;
    }
    .bg-pink {
        background-color: $pink;
    }
    .bg-red {
        background-color: $red;
    }
    .bg-orange {
        background-color: $orange;
    }
    .bg-yellow {
        background-color: $yellow;
    }
    .bg-green {
        background-color: $green;
    }
    .bg-teal {
        background-color: $teal;
    }
    .bg-cyan {
        background-color: $cyan;
    }

</style>
