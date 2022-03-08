import { withPluginApi } from "discourse/lib/plugin-api";
import showModal from "discourse/lib/show-modal";

function initializeCannedRepliesUIBuilder(api) {
  api.modifyClass("controller:composer", {
    pluginId: "discourse-canned-replies",
    actions: {
      showCannedRepliesButton() {
        if (this.site.mobileView) {
          showModal("canned-replies-modal");
        } else {
          this.appEvents.trigger("composer:show-preview");
          this.appEvents.trigger("canned-replies:show");
        }
      },
    },
  });

  api.addToolbarPopupMenuOptionsCallback(() => {
    return {
      id: "canned_replies_button",
      icon: "far-clipboard",
      action: "showCannedRepliesButton",
      label: "canned_replies.composer_button_text",
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
      currentUser?.can_use_canned_replies
    ) {
      withPluginApi("0.5", initializeCannedRepliesUIBuilder);
    }
  },
};
