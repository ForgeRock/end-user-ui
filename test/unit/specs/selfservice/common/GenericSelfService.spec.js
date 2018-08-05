import Vue from 'vue';
import GenericSelfService from '@/components/selfservice/common/GenericSelfService';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('GenericSelfService.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('Generic Self Service component loaded', () => {
        const wrapper = mount(GenericSelfService, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        properties: {
                            answer: {
                                type: 'string',
                                description: 'math'
                            }
                        }
                    }
                },
                inline: true
            }
        });

        expect(wrapper.name()).to.equal('Generic-Self-Service');
    });

    it('Correctly load generated boolean', () => {
        var data;

        const wrapper = mount(GenericSelfService, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        properties: {
                            answer: {
                                type: 'boolean',
                                description: 'math'
                            }
                        }
                    }
                },
                inline: true
            }
        });

        data = wrapper.vm.getData();

        expect(data.answer).to.equal(false);
    });

    it('Emit save event', () => {
        const wrapper = mount(GenericSelfService, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        properties: {
                            answer: {
                                type: 'boolean',
                                description: 'math'
                            }
                        }
                    }
                },
                inline: true
            }
        });

        wrapper.vm.save();

        expect(wrapper.emitted().advanceStage.length).to.equal(1);
    });
});
