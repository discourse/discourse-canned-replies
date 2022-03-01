import showModal from "discourse/lib/show-modal";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { getOwner } from "discourse-common/lib/get-owner";
import { ALL_TAGS_ID } from "select-kit/components/tag-drop";
import { schedule } from "@ember/runloop";

export default {
  setupComponent(args, component) {
    const currentUser = this.get("currentUser");
    const everyoneCanEdit =
      this.get("siteSettings.canned_replies_everyone_enabled") &&
      this.get("siteSettings.canned_replies_everyone_can_edit");
    const currentUserCanEdit =
      this.get("siteSettings.canned_replies_enabled") &&
      currentUser &&
      currentUser.can_edit_canned_replies;
    const canEdit = currentUserCanEdit ? currentUserCanEdit : everyoneCanEdit;
    this.set("canEdit", canEdit);

    component.setProperties({
      cannedVisible: false,
      loadingReplies: false,
      listFilter: "",
      replies: [],
      selectedTag: ALL_TAGS_ID,
      availableTags: [],
    });

    if (!component.appEvents.has("canned-replies:show")) {
      this.showCanned = () => component.send("show");
      component.appEvents.on("canned-replies:show", this, this.showCanned);
    }

    if (!component.appEvents.has("canned-replies:hide")) {
      this.hideCanned = () => component.send("hide");
      component.appEvents.on("canned-replies:hide", this, this.hideCanned);
    }
  },

  teardownComponent(component) {
    if (component.appEvents.has("canned-replies:show") && this.showCanned) {
      component.appEvents.off("canned-replies:show", this, this.showCanned);
      component.appEvents.off("canned-replies:hide", this, this.hideCanned);
    }
  },

  actions: {
    changeSelectedTag(tagId) {
      this.set("selectedTag", tagId);
    },
    show() {
      $("#reply-control .d-editor-preview-wrapper > .d-editor-preview").hide();
      this.setProperties({ cannedVisible: true, loadingReplies: true });

      ajax("/canned_replies")
        .then((results) => {
          this.setProperties({
            replies: results.replies,
            availableTags: Object.values(
              results.replies.reduce((availableTags, reply) => {
                reply.tags.forEach((tag) => {
                  if (availableTags[tag]) availableTags[tag].count += 1;
                  else availableTags[tag] = { id: tag, name: tag, count: 1 };
                });

                return availableTags;
              }, {})
            ),
          });
        })
        .catch(popupAjaxError)
        .finally(() => {
          this.set("loadingReplies", false);

          if (this.canEdit) {
            schedule("afterRender", () =>
              document.querySelector(".canned-replies-filter").focus()
            );
          }
        });
    },

    hide() {
      $(".d-editor-preview-wrapper > .d-editor-preview").show();
      this.set("cannedVisible", false);
    },

    newReply() {
      const composer = getOwner(this).lookup("controller:composer");
      composer.send("closeModal");

      showModal("new-reply").set("newContent", composer.model.reply);
    },
  },
};
