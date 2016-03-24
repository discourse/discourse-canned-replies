import ModalFunctionality from 'discourse/mixins/modal-functionality';

export default Ember.Controller.extend(ModalFunctionality, {
  templateName: "",
  templateType: "regular",
  teplateTypeNumber: 1,
  templateTypes: [],


  actions: {
    apply: function() {
      var name = this.get("templateName"), type = this.get("templateType"), self = this, composerOutput = "";
      for(this.i=0; this.i<this.siteSettings.template_manager_number ; this.i++){
        if(type==this.templateTypes[this.i].value)composerOutput += this.templateTypes[this.i].content;
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
    this.splitArray = this.siteSettings.template_manager_one.split("|");
    this.splitContentArray = this.siteSettings.template_manager_messages.split("|");
    for(this.i=0; this.i<this.siteSettings.template_manager_number ; this.i++){
      this.templateTypes[this.i] = { 'title': this.splitArray[this.i], 'value': this.splitArray[this.i], 'content': this.splitContentArray[this.i]};
      //alert(this.splitArray[this.i]);
    }
    this.addObserver("templateType", function() {
      this.refresh();
    }.bind(this));
  }
});
