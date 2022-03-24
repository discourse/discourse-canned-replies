import Component from "@ember/component";
import { action } from "@ember/object";

import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import { prepareReply } from "../lib/apply-reply";

export default Component.extend({
  classNames: ["canned-replies-canned-reply"],

  @action
  apply() {
    const reply = prepareReply(
      this.reply.title,
      this.reply.content,
      this.model
    );

    // run parametrized action to insert the reply
    this.onInsertReply?.(reply);

    ajax(`/canned_replies/${this.reply.id}/use`, {
      type: "POST",
    }).catch(popupAjaxError);
  },
});
