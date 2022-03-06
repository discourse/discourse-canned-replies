import showModal from "discourse/lib/show-modal";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { getOwner } from "discourse-common/lib/get-owner";
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
      replies: [],
      filteredReplies: [],
    });

    if (!component.appEvents.has("canned-replies:show")) {
      this.showCanned = () => component.send("show");
      component.appEvents.on("canned-replies:show", this, this.showCanned);
    }

    if (!component.appEvents.has("canned-replies:hide")) {
      this.hideCanned = () => component.send("hide");
      component.appEvents.on("canned-replies:hide", this, this.hideCanned);
    }

    component.addObserver("listFilter", function () {
      const filterTitle = component.listFilter.toLowerCase();
      const filtered = component.replies
        .map((reply) => {
          /* Give a relevant score to each reply. */
          reply.score = 0;
          if (reply.title.toLowerCase().indexOf(filterTitle) !== -1) {
            reply.score += 2;
          } else if (reply.content.toLowerCase().indexOf(filterTitle) !== -1) {
            reply.score += 1;
          }
          return reply;
        })
        .filter((reply) => reply.score !== 0) // Filter irrelevant replies.
        .sort((a, b) => {
          /* Sort replies by relevance and title. */
          if (a.score !== b.score) {
            return a.score > b.score ? -1 : 1; /* descending */
          } else if (a.title !== b.title) {
            return a.title < b.title ? -1 : 1; /* ascending */
          }
          return 0;
        });
      component.set("filteredReplies", filtered);
    });
  },

  teardownComponent(component) {
    if (component.appEvents.has("canned-replies:show") && this.showCanned) {
      component.appEvents.off("canned-replies:show", this, this.showCanned);
      component.appEvents.off("canned-replies:hide", this, this.hideCanned);
    }
  },

  actions: {
    show() {
      $("#reply-control .d-editor-preview-wrapper > .d-editor-preview").hide();
      this.setProperties({ cannedVisible: true, loadingReplies: true });

      ajax("/canned_replies")
        .then((results) => {
          this.setProperties({
            replies: results.replies,
            filteredReplies: results.replies,
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
