import applyReply from "discourse/plugins/discourse-canned-replies/lib/apply-reply";
import Component from "@ember/component";
import { getOwner } from "discourse-common/lib/get-owner";

export default Component.extend({
  actions: {
    apply() {
      const composer = getOwner(this).lookup("controller:composer");

      applyReply(
        this.get("reply.id"),
        this.get("reply.title"),
        this.get("reply.content"),
        composer.model
      );

      this.appEvents.trigger("canned-replies:hide");
    },
  },
});
