import ModalFunctionality from 'discourse/mixins/modal-functionality';

export default Ember.Controller.extend(ModalFunctionality, {
  templateName: "",
  templateType: "regular",
  teplateTypeNumber: 1,
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
	       composerOutput += "## I have:\r\n[] Described my learning process  \r\n [] Said how long it took  \r\n[ ] linked to my blog!  \r\n";
      }
      else if (type == "stupid") {
        composerOutput += "## Stupid template:\r\n[] Apple  \r\n [] Two  \r\n[ ] C  \r\n";
      }
      else if (type == "stupid") {
        composerOutput += "## I have:\r\n[] Described my learning process  \r\n [] Said how long it took  \r\n[ ] linked to my blog!  \r\n";
      }
      else if (type == "multiple") {
        composerOutput += "## I have:\r\n[] made an anonymous post  \r\n [] mustread screen shot  \r\n[ ] Liked 3 posts  \r\n [ ] Flagged a post  \r\n";
      }
      else if (type == "fromSettings") {
        composerOutput += "## settings template should be here\r\n";
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
    this.templateTypes = []
    alert(this.siteSettings.template_number);
    this.splitArray = this.siteSettings.template_manager_one.split("|");
    for(this.i=0; this.i<this.siteSettings.template_number ; this.i++){
      this.templateTypes[this.i] = { 'title': this.i, 'value': this.splitArray[this.i]};
      //alert(this.splitArray[this.i]);
    }
    this.addObserver("templateType", function() {
      this.refresh();
    }.bind(this));
  }
});
