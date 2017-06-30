import showModal from 'discourse/lib/show-modal';
import { ajax } from 'discourse/lib/ajax';
import { i18n } from 'discourse/lib/computed';
import { popupAjaxError } from 'discourse/lib/ajax-error';

export default {

  setupComponent(args, component) {
    component.set('isVisible', false);
    component.set('loadingReplies', false);
    component.set('replies', []);
    component.set('filterHint', i18n('canned_replies.filter_hint'));

    component.appEvents.on('canned-replies:show', () => {
      component.send('show');
    });

    component.appEvents.on('canned-replies:hide', () => {
      component.send('hide');
    });

    component.addObserver('listFilter', function () {
      const filterTitle = component.get('listFilter').toLowerCase();

      component.set('loadingReplies', true);
      ajax("/canned_replies").then(results => {
        component.set("replies", results.replies.filter(function (reply) {
          return reply.title.toLowerCase().indexOf(filterTitle) !== -1;
        }));
      }).catch(popupAjaxError).finally(() => component.set('loadingReplies', false));
    });
  },

  actions: {
    show() {
      $(".d-editor-preview").hide();
      this.set('isVisible', true);

      this.set('loadingReplies', true);
      ajax("/canned_replies").then(results => {
        this.set("replies", results.replies);
      }).catch(popupAjaxError).finally(() => this.set('loadingReplies', false));
    },

    hide() {
      $(".d-editor-preview").show();
      this.set('isVisible', false);
    },

    newReply() {
      // TODO: This is ugly. There _must_ be another way.
      const composerController = Discourse.__container__.lookup('controller:composer');
      composerController.send('closeModal');
      showModal('new-reply').setProperties({ newContent: composerController.model.reply });
    }
  }

};
