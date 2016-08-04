import { withPluginApi } from 'discourse/lib/plugin-api';
import showModal from 'discourse/lib/show-modal';
import ComposerController from 'discourse/controllers/composer';

function initializeCannedRepliesUIBuilder(api) {
  ComposerController.reopen({
    actions: {
      showCannedRepliesButton: function () {
        showModal('canned-replies').setProperties({composerModel: this.model});
      }
    }
  });

  api.addToolbarPopupMenuOptionsCallback(function () {
    return {
      id: "canned_replies_button",
      icon: "clipboard",
      action: 'showCannedRepliesButton',
      label: 'canned_replies.composer_button_text'
    };
  });
}

export default {
  name: "add-cannedreplies-ui-builder",

  initialize(container) {
    const siteSettings = container.lookup('site-settings:main');
    if (siteSettings.canned_replies_enabled && Discourse.User.current() != null && Discourse.User.current().staff) {
      withPluginApi('0.5', initializeCannedRepliesUIBuilder);
    }
  }
};
