import ModalFunctionality from "discourse/mixins/modal-functionality";
import showModal from "discourse/lib/show-modal";
import { ajax } from "discourse/lib/ajax";
import { default as computed } from "ember-addons/ember-computed-decorators";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default Ember.Controller.extend(ModalFunctionality, {
  replyTitle: "",
  replyContent: "",
  replyId: "",
  saving: null,

  onShow() {
    this.setProperties({
      saving: null
    });
  },

  @computed("saving")
  savingLabel(saving) {
    return saving === null ? "save" : saving ? "saving" : "saved";
  },

  @computed("replyTitle", "replyContent", "saving")
  disableSaveButton(replyTitle, replyContent, saving) {
    return saving || replyTitle === "" || replyContent === "";
  },

  actions: {
    save() {
      this.set("saving", true);

      ajax(`/canned_replies/${this.get("replyId")}`, {
        type: "PATCH",
        data: {
          title: this.get("replyTitle"),
          content: this.get("replyContent")
        }
      })
        .catch(popupAjaxError)
        .finally(() => {
          this.set("saving", false);
          this.appEvents.trigger("canned-replies:show");
        });
    },

    remove() {
      bootbox.confirm(I18n.t("canned_replies.edit.remove_confirm"), result => {
        if (result) {
          ajax(`/canned_replies/${this.get("replyId")}`, {
            type: "DELETE"
          })
            .then(() => {
              this.send("closeModal");
              if (this.site.mobileView) {
                showModal("canned-replies");
              } else {
                this.appEvents.trigger("canned-replies:show");
              }
            })
            .catch(popupAjaxError);
        }
      });
    },

    cancel() {
      this.send("closeModal");
      if (this.site.mobileView) {
        showModal("canned-replies");
      } else {
        this.appEvents.trigger("canned-replies:show");
      }
    }
  }
});
