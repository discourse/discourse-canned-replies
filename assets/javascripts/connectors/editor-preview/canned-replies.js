import { action } from "@ember/object";
import { getOwner } from "discourse-common/lib/get-owner";
import { insertReplyIntoComposer } from "../../lib/apply-reply";

const SELECTOR_EDITOR_PREVIEW =
  "#reply-control .d-editor-preview-wrapper > .d-editor-preview";

export default {
  setupComponent(args, component) {
    component.setProperties({
      cannedVisible: false,
      model: getOwner(this).lookup("controller:composer").model,
    });

    this.appEvents.on("canned-replies:show", this, "show");
    this.appEvents.on("canned-replies:hide", this, "hide");
  },

  teardownComponent() {
    this.appEvents.off("canned-replies:show", this, "show");
    this.appEvents.off("canned-replies:hide", this, "hide");
  },

  shouldRender(args, component) {
    return !component.site.mobileView;
  },

  @action
  show() {
    const elemEditorPreview = document.querySelector(SELECTOR_EDITOR_PREVIEW);
    if (elemEditorPreview) {
      elemEditorPreview.style.display = "none";
    }

    this.set("cannedVisible", true);
  },

  @action
  hide() {
    const elemEditorPreview = document.querySelector(SELECTOR_EDITOR_PREVIEW);
    if (elemEditorPreview) {
      elemEditorPreview.style.display = "";
    }

    this.set("cannedVisible", false);
  },

  @action
  insertReply(reply) {
    insertReplyIntoComposer(this, reply);
  },
};
