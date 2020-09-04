import ModalFunctionality from "discourse/mixins/modal-functionality";
import showModal from "discourse/lib/show-modal";
import { ajax } from "discourse/lib/ajax";
import { default as computed } from "ember-addons/ember-computed-decorators";
import { popupAjaxError } from "discourse/lib/ajax-error";

export default Ember.Controller.extend(ModalFunctionality, {
  newTitle: "",
  newContent: "",

  onShow() {
    this.setProperties({
      newTitle: "",
      newContent: "",
    });
  },

  @computed("newTitle", "newContent")
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
