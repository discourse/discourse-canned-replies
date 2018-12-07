import showModal from "discourse/lib/show-modal";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { getOwner } from "discourse-common/lib/get-owner";

export default {
  setupComponent(args, component) {
    component.set("isVisible", false);
    component.set("loadingReplies", false);
    component.set("replies", []);
    component.set("filteredReplies", []);

    if (!component.appEvents.has("canned-replies:show")) {
      component.appEvents.on("canned-replies:show", () => {
        component.send("show");
      });
    }

    if (!component.appEvents.has("canned-replies:hide")) {
      component.appEvents.on("canned-replies:hide", () => {
        component.send("hide");
      });
    }

    component.appEvents.on("composer:will-close", () => {
      component.appEvents.off("canned-replies:show");
      component.appEvents.off("canned-replies:hide");
    });

    component.addObserver("listFilter", function() {
      const filterTitle = component.get("listFilter").toLowerCase();
      const filtered = component
        .get("replies")
        .map(function(reply) {
          /* Give a relevant score to each reply. */
          reply.score = 0;
          if (reply.title.toLowerCase().indexOf(filterTitle) !== -1) {
            reply.score += 2;
          } else if (reply.content.toLowerCase().indexOf(filterTitle) !== -1) {
            reply.score += 1;
          }
          return reply;
        })
        .filter(function(reply) {
          /* Filter irrelevant replies. */
          return reply.score !== 0;
        })
        .sort(function(a, b) {
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

  actions: {
    show() {
      $("#reply-control .d-editor-preview-wrapper > .d-editor-preview").hide();
      this.set("isVisible", true);
      this.set("loadingReplies", true);

      ajax("/canned_replies")
        .then(results => {
          this.set("replies", results.replies);
          this.set("filteredReplies", results.replies);
        })
        .catch(popupAjaxError)
        .finally(() => {
          this.set("loadingReplies", false);

          Em.run.schedule("afterRender", () => {
            $(".canned-replies-filter").focus();
          });
        });
    },

    hide() {
      $(".d-editor-preview-wrapper > .d-editor-preview").show();
      this.set("isVisible", false);
    },

    newReply() {
      const composer = getOwner(this).lookup("controller:composer");
      composer.send("closeModal");

      showModal("new-reply").setProperties({
        newContent: composer.model.reply
      });
    }
  }
};
