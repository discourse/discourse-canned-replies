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

    this.showCanned = () => component.send("show");
    component.appEvents.on("canned-replies:show", this, this.showCanned);

    this.hideCanned = () => component.send("hide");
    component.appEvents.on("canned-replies:hide", this, this.hideCanned);
  },

  teardownComponent(component) {
    component.appEvents.off("canned-replies:show", this, this.showCanned);
    component.appEvents.off("canned-replies:hide", this, this.hideCanned);
  },

  shouldRender(args, component) {
    return !component.site.mobileView;
  },

  @action
  show() {
    $(SELECTOR_EDITOR_PREVIEW).hide();
    this.set("cannedVisible", true);
  },

  @action
  hide() {
    $(SELECTOR_EDITOR_PREVIEW).show();
    this.set("cannedVisible", false);
  },

  @action
  insertReply(reply) {
    insertReplyIntoComposer.call(this, reply);
  },
};
