import { withPluginApi } from 'discourse/lib/plugin-api';
import showModal from 'discourse/lib/show-modal';
import ComposerController from 'discourse/controllers/composer';

function initializeCannedRepliesUIBuilder(api) {
  api.onToolbarCreate(toolbar => {
    toolbar.addButton({
      id: 'canned_replies_button',
      group: 'extras',
      icon: 'clipboard',
      action: function () {
        const controller = Discourse.__container__.lookup('controller:composer');
        if (controller.site.mobileView) {
          showModal('canned-replies').setProperties({ composerModel: controller.model });
        } else {
          controller.appEvents.trigger('composer:show-preview');
          controller.appEvents.trigger('canned-replies:show');
        }
      },
      title: 'canned_replies.composer_button_text'
    });
  });
}

export default {
  name: "add-canned-replies-ui-builder",

  initialize(container) {
    const siteSettings = container.lookup('site-settings:main');
    const currentUser = container.lookup('current-user:main');

    if (siteSettings.canned_replies_enabled && currentUser && currentUser.staff) {
      withPluginApi('0.5', initializeCannedRepliesUIBuilder);
    }
  },
};
