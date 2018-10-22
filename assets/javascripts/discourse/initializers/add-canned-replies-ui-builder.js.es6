import { withPluginApi } from "discourse/lib/plugin-api";
import showModal from "discourse/lib/show-modal";
import ComposerController from "discourse/controllers/composer";

function initializeCannedRepliesUIBuilder(api) {
  ComposerController.reopen({
    actions: {
      showCannedRepliesButton: function() {
        if (this.site.mobileView) {
          showModal("canned-replies").setProperties({
            composerModel: this.model
          });
        } else {
          this.appEvents.trigger("composer:show-preview");
          this.appEvents.trigger("canned-replies:show");
        }
      }
    }
  });

  api.addToolbarPopupMenuOptionsCallback(function() {
    return {
      id: "canned_replies_button",
      icon: "clipboard",
      action: "showCannedRepliesButton",
      label: "canned_replies.composer_button_text"
    };
  });
}

export default {
  name: "add-canned-replies-ui-builder",

  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    const currentUser = container.lookup("current-user:main");

    if (
      siteSettings.canned_replies_enabled &&
      currentUser &&
      currentUser.staff
    ) {
      withPluginApi("0.5", initializeCannedRepliesUIBuilder);
    }
  }
};
