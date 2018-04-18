import Vue from 'vue';
import KBASecurityAnswerDefinitionStage from '@/components/selfservice/registration/KBASecurityAnswerDefinitionStage';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';

describe('KBASecurityAnswerDefinitionStage.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);

    const i18n = new VueI18n({
        locale: 'en',
        messages: translations
    });

    it('KBASecurityAnswerDefinitionStage component loaded', () => {
        const wrapper = mount(KBASecurityAnswerDefinitionStage, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        properties: {
                            kba: {}
                        }
                    }
                }
            }
        });

        expect(wrapper.name()).to.equal('KBA-Security-Answer-Definition-Stage');
    });

    it('creates the correct number of selects and inputs', () => {
        const wrapper = mount(KBASecurityAnswerDefinitionStage, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        properties: {
                            kba: {
                                minItems: 4,
                                questions: [
                                    {
                                        question: {
                                            en: 'What\'s your favorite color?'
                                        },
                                        id: '1'
                                    },
                                    {
                                        question: {
                                            en: 'Who was your first employer?'
                                        },
                                        id: '2'
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        });

        expect(wrapper.vm.$data.selected.length).to.equal(4);
        expect(wrapper.findAll('select').length).to.equal(4);
        expect(wrapper.findAll('input').length).to.equal(4);
    });

    it('disables questions when they are selected', () => {
        const wrapper = mount(KBASecurityAnswerDefinitionStage, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        properties: {
                            kba: {
                                minItems: 4,
                                questions: [
                                    {
                                        question: {
                                            en: 'What\'s your favorite color?'
                                        },
                                        id: '1'
                                    },
                                    {
                                        question: {
                                            en: 'Who was your first employer?'
                                        },
                                        id: '2'
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        });

        // choose first value in select
        wrapper.vm.selected[0].selected = '1';
        expect(wrapper.vm.options[1].disabled).to.equal(true);
        wrapper.vm.selected[1].selected = '2';
        expect(wrapper.vm.options[2].disabled).to.equal(true);
    });

    it('adds "question" input when custom option is selected', () => {
        const wrapper = mount(KBASecurityAnswerDefinitionStage, {
            i18n,
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        properties: {
                            kba: {
                                minItems: 4,
                                questions: [
                                    {
                                        question: {
                                            en: 'What\'s your favorite color?'
                                        },
                                        id: '1'
                                    },
                                    {
                                        question: {
                                            en: 'Who was your first employer?'
                                        },
                                        id: '2'
                                    }
                                ]
                            }
                        }
                    }
                }
            }
        });

        // choose "custom" option in select
        wrapper.vm.selected[0].selected = '4';

        expect(wrapper.find('input').element.placeholder).to.equal('Question');
    });

    it('correctly formats save object', () => {
        const wrapper = mount(KBASecurityAnswerDefinitionStage, {
                i18n,
                propsData: {
                    selfServiceDetails: {
                        requirements: {
                            properties: {
                                kba: {
                                    minItems: 4,
                                    questions: [
                                        {
                                            question: {
                                                en: 'What\'s your favorite color?'
                                            },
                                            id: '1'
                                        },
                                        {
                                            question: {
                                                en: 'Who was your first employer?'
                                            },
                                            id: '2'
                                        }
                                    ]
                                }
                            }
                        }
                    }
                }
            }),
            saveObj = {
                kba: [
                    {
                        customQuestion: 'What\'s your favorite food',
                        answer: 'eggs'
                    },
                    {
                        questionId: '1',
                        answer: 'red'
                    },
                    {
                        customQuestion: 'What street did you grow up on?',
                        answer: 'main'
                    },
                    {
                        questionId: '2',
                        answer: 'google'
                    }
                ]
            };

        // fill out form fields
        wrapper.vm.answers = [
            {
                answer: 'eggs',
                questionId: null,
                customQuestion: 'What\'s your favorite food'
            },
            {
                answer: 'red',
                questionId: null,
                customQuestion: null
            },
            {
                answer: 'main',
                questionId: null,
                customQuestion: 'What street did you grow up on?'
            },
            {
                answer: 'google',
                questionId: null,
                customQuestion: null
            }
        ];

        wrapper.vm.selected = [
            { selected: '4' },
            { selected: '1' },
            { selected: '4' },
            { selected: '2' }
        ];
        wrapper.vm.save();

        expect(wrapper.vm.getData()).to.be.a('object');
        expect(wrapper.vm.getData()).to.deep.equal(saveObj);
    });
});
