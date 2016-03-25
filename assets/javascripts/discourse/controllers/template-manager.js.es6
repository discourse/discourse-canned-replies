import ModalFunctionality from 'discourse/mixins/modal-functionality';

export default Ember.Controller.extend(ModalFunctionality, {
  templateName: "",
  templateType: "regular",
  teplateTypeNumber: 1,
  templateTypes: [],


  actions: {
    apply: function() {
      var name = this.get("templateName"), type = this.get("templateType"), self = this, composerOutput = "";
      for(this.i=0; this.i<this.template_number ; this.i++){
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
    this.template_number = this.splitArray.length;
    for(this.i=0; this.i<this.template_number ; this.i++){
      this.messageValues = this.splitArray[this.i].split(/:(.+)/);
      this.templateTypes[this.i] = { 'title': this.messageValues[0], 'value': this.messageValues[0], 'content': this.messageValues[1]};
      //alert(this.splitArray[this.i]);
    }
    this.addObserver("templateType", function() {
      this.refresh();
    }.bind(this));
  }
});
