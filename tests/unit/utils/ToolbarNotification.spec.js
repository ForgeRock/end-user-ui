import Vue from 'vue';
import ToolbarNotification from '@/components/utils/ToolbarNotification';
import i18n from '@/i18n';
import BootstrapVue from 'bootstrap-vue';
import { expect } from 'chai';
import { shallowMount } from '@vue/test-utils';
import Sinon from 'sinon';

describe('ToolbarNotification.vue', () => {
    var sandbox = null;
    let wrapper = null;
    let notifications = [{
        createDate: '2018-06-04T16:20:04.795',
        message: 'Your profile has been updated',
        notificationSubtype: '',
        notificationType: '',
        receiverId: 'a7c9f2ab-52c4-47bb-9ec9-bfeb78f56898',
        _id: 'a4b8900c-d934-4a5f-962f-ee734728882c'
    }, {
        createDate: '2018-06-04T16:21:04.795',
        message: 'Your profile has been updated again',
        notificationSubtype: '',
        notificationType: '',
        receiverId: 'a7c9f2ab-52c4-47bb-9ec9-bfeb78f56898',
        _id: 'a4b8900c-d934-4a5f-962f-ee734728882c'
    }];

    Vue.use(BootstrapVue);

    beforeEach(function () {
        sandbox = Sinon.createSandbox();
        sandbox.stub(ToolbarNotification, 'mounted').callsFake(() => {});

        wrapper = shallowMount(ToolbarNotification, {
            i18n,
            methods: {
                getRequestService: Sinon.stub().callsFake(() => {
                    return {
                        get: Sinon.stub().callsFake(() => {
                            return {
                                then: Sinon.stub().callsFake(() => {
                                    return {
                                        data: {
                                            _notifications: notifications
                                        },
                                        catch: () => {}
                                    };
                                })
                            };
                        })
                    };
                })
            }
        });
        wrapper.vm.$root.userStore = {
            state: {
                userId: '123'
            }
        };

        wrapper.setData({
            notifications: notifications
        });
    });

    afterEach(function () {
        sandbox.restore();
    });

    it('Toolbar Notification component loaded', () => {
        expect(wrapper.name()).to.equal('Toolbar-Notification');
    });

    it('Toolbar Notifications sort by time', () => {
        expect(notifications[0].message).to.equal('Your profile has been updated');
        expect(notifications[1].message).to.equal('Your profile has been updated again');

        notifications = wrapper.vm.sortByDate(notifications);

        expect(notifications[1].message).to.equal('Your profile has been updated');
        expect(notifications[0].message).to.equal('Your profile has been updated again');
    });
});
