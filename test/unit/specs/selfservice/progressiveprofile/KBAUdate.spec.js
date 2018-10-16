import Vue from 'vue';
import KBAUpdate from '@/components/selfservice/progressiveprofile/KBAUpdate';
import VueI18n from 'vue-i18n';
import BootstrapVue from 'bootstrap-vue';
import translations from '@/translations';
import { mount } from '@vue/test-utils';
import VeeValidate from 'vee-validate';

describe('KBAUpdate.vue', () => {
    Vue.use(VueI18n);
    Vue.use(BootstrapVue);
    Vue.use(VeeValidate, { inject: false, fastExit: false });

    const i18n = new VueI18n({
            locale: 'en',
            messages: translations
        }),
        v = new VeeValidate.Validator();

    let wrapper;

    beforeEach(() => {
        wrapper = mount(KBAUpdate, {
            provide: () => ({
                $validator: v
            }),
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
    });

    it('KBAUpdate component loaded', () => {
        expect(wrapper.name()).to.equal('KBA-Update-Stage');
    });

    it('creates the correct number of selects and inputs', () => {
        expect(wrapper.vm.$data.selected.length).to.equal(4);
        expect(wrapper.findAll('select').length).to.equal(4);
        expect(wrapper.findAll('input').length).to.equal(4);
    });

    it('disables questions when they are selected', () => {
        // choose first value in select
        wrapper.vm.selected[0].selected = '1';
        expect(wrapper.vm.options[1].disabled).to.equal(true);
        wrapper.vm.selected[1].selected = '2';
        expect(wrapper.vm.options[2].disabled).to.equal(true);
    });

    it('adds "question" input when custom option is selected', () => {
        // choose "custom" option in select
        const select = wrapper.find('select').element;

        select.value = '3';
        select.dispatchEvent(new Event('change'));

        expect(wrapper.findAll('input[name="question"]').length).to.equal(1);
    });

    it('correctly formats save object', () => {
        let data;

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
            { selected: '3' },
            { selected: '1' },
            { selected: '3' },
            { selected: '2' }
        ];

        data = wrapper.vm.getData();

        expect(data).to.be.an('object');
        expect(data.kba).to.be.an('array');
        expect(data.kba[0]).to.be.an('object');
        expect(data.kba[0]).to.have.property('questionId');
        expect(data.kba[0]).to.have.property('answer');
        expect(data.kba[0].questionId).to.equal('3');
        expect(data.kba[0].answer).to.equal('eggs');
        expect(data.kba[1].questionId).to.equal('1');
        expect(data.kba[1].answer).to.equal('red');
        expect(data.kba[2].questionId).to.equal('3');
        expect(data.kba[2].answer).to.equal('main');
        expect(data.kba[3].questionId).to.equal('2');
        expect(data.kba[3].answer).to.equal('google');

        wrapper.vm.customIndex = '3';
        data = wrapper.vm.getData();
        expect(data.kba[2].customQuestion).to.equal('What street did you grow up on?');
    });

    it('allows selecting defined questions', () => {
        wrapper = mount(KBAUpdate, {
            i18n,
            provide: () => ({
                $validator: v
            }),
            propsData: {
                selfServiceDetails: {
                    requirements: {
                        properties: {
                            kba: {
                                minItems: 2,
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

        // select defined questions
        wrapper.vm.selected = [
            { selected: '1' },
            { selected: '2' }
        ];

        // inputs should match the number of questions selected
        expect(wrapper.findAll('input').length).to.equal(2);
        // should not find a 'question' input
        expect(wrapper.findAll('input[name="question"]').length).to.equal(0);
    });
});
