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
    if (!siteSettings.canned_replies_enabled) {
      return;
    }

    const currentUser = container.lookup("current-user:main");
    let currentUserGroupNames = [];
    if (currentUser && currentUser.groups) {
      currentUserGroupNames = currentUser.groups.map(group =>
        group.name.toLowerCase()
      );
    }
    const cannedRepliesGroups = siteSettings.canned_replies_groups
      .split("|")
      .filter(x => x)
      .map(x => x.toLowerCase());
    if (
      currentUser &&
      (currentUser.staff ||
        currentUserGroupNames.some(group =>
          cannedRepliesGroups.includes(group)
        ))
    ) {
      withPluginApi("0.5", initializeCannedRepliesUIBuilder);
    }
  }
};
