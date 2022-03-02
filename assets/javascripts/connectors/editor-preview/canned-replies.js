import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { ALL_TAGS_ID } from "select-kit/components/tag-drop";
import { schedule } from "@ember/runloop";

export default {
  setupComponent(args, component) {
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

          schedule("afterRender", () =>
            document.querySelector(".canned-replies-filter").focus()
          );
        });
    },

    hide() {
      $(".d-editor-preview-wrapper > .d-editor-preview").show();
      this.set("cannedVisible", false);
    },
  },
};
