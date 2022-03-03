export default {
  setupComponent(args, component) {
    component.set("cannedVisible", false);

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
    show() {
      $("#reply-control .d-editor-preview-wrapper > .d-editor-preview").hide();
      this.set("cannedVisible", true);
    },

    hide() {
      $(".d-editor-preview-wrapper > .d-editor-preview").show();
      this.set("cannedVisible", false);
    },
  },
};
