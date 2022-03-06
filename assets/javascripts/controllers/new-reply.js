import Controller from "@ember/controller";
import ModalFunctionality from "discourse/mixins/modal-functionality";
import showModal from "discourse/lib/show-modal";
import { ajax } from "discourse/lib/ajax";
import discourseComputed from "discourse-common/utils/decorators";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default Controller.extend(ModalFunctionality, {
  newTitle: "",
  newContent: "",

  onShow() {
    this.setProperties({
      newTitle: "",
      newContent: "",
    });
  },

  @discourseComputed("newTitle", "newContent")
  disableSaveButton(newTitle, newContent) {
    return newTitle === "" || newContent === "";
  },

  actions: {
    save() {
      ajax("/canned_replies", {
        type: "POST",
        data: { title: this.newTitle, content: this.newContent },
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
    },

    cancel() {
      this.send("closeModal");
      if (this.site.mobileView) {
        showModal("canned-replies");
      } else {
        this.appEvents.trigger("canned-replies:show");
      }
    },
  },
});
