import ModalFunctionality from 'discourse/mixins/modal-functionality';

export default Ember.Controller.extend(ModalFunctionality, {
  templateName: "",
  templateType: "regular",
  templateTypes: [
    { 'title': I18n.t("template_manager.template_type.regular"), 'value': "regular" },
    { 'title': I18n.t("template_manager.template_type.multiple"), 'value': "multiple" },
      { 'title': I18n.t("template_manager.template_type.number"), 'value': "number" },
    { 'title': I18n.t("template_manager.template_type.stupid"), 'value': "stupid" }
  ],

  actions: {
    apply: function() {
      var name = this.get("templateName"), type = this.get("templateType"), self = this, composerOutput = "";
      if (type == "regular") {
	composerOutput += "## Regular template:\r\n[] One \r\n []Two \r\n[ ] three\r\n";
      }
      else if (type == "stupid") {
        composerOutput += "## Stupid template:\r\n[] Apple \r\n [] Two \r\n[ ] C\r\n";
      }
      else if (type == "stupid") {
        composerOutput += "## Stupid template:\r\n[] 1 \r\n [] 2 \r\n[ ] 3\r\n";
      }
      else if (type == "multiple") {
        composerOutput += "## Multiple template:\r\n[] A \r\n [] B \r\n[ ] C\r\n";
      }
      else {
	  composerOutput += "This is not a template!\r\n";
      }
      if (self.composerViewOld)
        self.composerViewOld.addMarkdown(composerOutput);
      else if (self.composerView) {
        self.composerView._addText(self.composerView._getSelected(), composerOutput);
      }
      this.send('closeModal');
    }
  },

  refresh: function() {
  },

  onShow: function() {
    this.setProperties({templateName: "", templateType: "regular"});
  },

  init: function () {
    this._super();

    this.addObserver("templateType", function() {
      this.refresh();
    }.bind(this));
  }
});
