import showModal from 'discourse/lib/show-modal';
import ApplicationRoute from 'discourse/routes/application';
import ComposerView from 'discourse/views/composer';
import { onToolbarCreate } from 'discourse/components/d-editor';
import NewComposer from 'discourse/components/d-editor';

export default
{
  name: 'canned-replies',
  initialize(container)
  {
    const siteSettings = container.lookup('site-settings:main');
    const store = container.lookup('store:main');

    if (siteSettings.template_manager_enabled) {
      if (NewComposer !== "undefined") {
        NewComposer.reopen({
          actions: {
            showTemplateButton: function() {
              showModal('canned-replies').setProperties({composerView: this});
            }
          }
        });

        onToolbarCreate(toolbar => {
          toolbar.addButton({
            id: "canned_replies_button",
            group: "extras",
            icon: "clipboard",
            action: 'showTemplateButton'
          });
        });
      } else {
        ApplicationRoute.reopen({
          actions: {
            showTemplateButton: function (composerView) {
              showModal('canned-replies').setProperties({composerViewOld: composerView});
            }
          }
        });

        ComposerView.reopen({
          initEditor: function () {
            // overwrite and wrap.
            this._super();
            var view = this;
            var button_text = I18n.t("canned_replies.composer_button_text");
            var btn = $('<button class="wmd-button wmd-template-manager-button" title="' + button_text + '" aria-label="' + button_text + '"></button>');
            btn.click(function () {
              view.get("controller").send("showTemplateButton", view);
            });
            $("#wmd-button-row,.wmd-button-row").append(btn);
          }
        });
      }
    }
  }
};
