import ModalFunctionality from 'discourse/mixins/modal-functionality';
import showModal from 'discourse/lib/show-modal';
import { ajax } from 'discourse/lib/ajax';
import { default as computed } from 'ember-addons/ember-computed-decorators';
import { popupAjaxError } from 'discourse/lib/ajax-error';

export default Ember.Controller.extend(ModalFunctionality, {
  newTitle: "",
  newContent: "",

  @computed('newTitle', 'newContent')
  disableSaveButton(newTitle, newContent) {
    return newTitle === "" || newContent === "";
  },

  actions: {
    save() {
      ajax("/canned_replies", {
        type: "POST",
        data: { title: this.get('newTitle'), content: this.get('newContent') }
      }).then(() => {
        this.send('closeModal');
        showModal('canned-replies');
      }).catch(popupAjaxError);
    },

    cancel() {
      this.send('closeModal');
      showModal('canned-replies');
    }
  }
});
