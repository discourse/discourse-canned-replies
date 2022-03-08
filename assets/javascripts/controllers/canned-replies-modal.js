import Controller from "@ember/controller";
import { action } from "@ember/object";
import { getOwner } from "discourse-common/lib/get-owner";
import ModalFunctionality from "discourse/mixins/modal-functionality";
import { insertReplyIntoComposer } from "../lib/apply-reply";

export default Controller.extend(ModalFunctionality, {
  init() {
    this._super(...arguments);
    this.set("model", getOwner(this).lookup("controller:composer").model);
  },

  @action
  hide() {
    this.send("closeModal");
  },

  @action
  insertReply(reply) {
    insertReplyIntoComposer.call(this, reply);
  },
});
