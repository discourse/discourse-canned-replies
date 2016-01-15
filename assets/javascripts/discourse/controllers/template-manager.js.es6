import ModalFunctionality from 'discourse/mixins/modal-functionality';

export default Ember.Controller.extend(ModalFunctionality, {
  pollName: "",
  pollType: "regular",
  pollTypes: [
    { 'title': I18n.t("template_manager.template_type.regular"), 'value': "regular" },
    { 'title': I18n.t("template_manager.template_type.multiple"), 'value': "multiple" },
      { 'title': I18n.t("template_manager.template_type.number"), 'value': "number" },
    { 'title': I18n.t("template_manager.template_type.stupid"), 'value': "stupid" }
  ],
  pollOptions: "",
  pollAnswerValue: "",
  choicesClass: Discourse.SiteSettings.template_manager_provide_answers ? "has-answers" : "no-answers",
  canProvideAnswers: Discourse.SiteSettings.template_manager_provide_answers,

  isNumberPoll: function() {
    return this.get("pollType") === "number";
  }.property("pollType"),

  isMultipleOrNumberPoll: function() {
    return this.get("pollType") === "multiple"
        || this.get("pollType") === "number";
  }.property("pollType"),

  // Validate the Minimum Value.
  minValueValidation: function() {
    var mustBeNumeric = new RegExp(/^[\d]+$/),
      minValue = this.get('pollMinValue'),
      intMinValue = parseInt(this.get('pollMinValue')),
      intMaxValue = parseInt(this.get('pollMaxValue'));
    if (Ember.isEmpty(minValue) || !parseInt(minValue) || !mustBeNumeric.test(minValue)) {
      return Discourse.InputValidation.create({ failed: true, reason: I18n.t("template_manager.poll_min_must_be_numeric") });
    }

    if (intMinValue > intMaxValue) {
      return Discourse.InputValidation.create({ failed: true, reason: I18n.t("template_manager.poll_min_must_be_less_than_max") });
    }

    return Discourse.InputValidation.create({ok: true});
  }.property('pollMinValue', 'pollMaxValue'),

  // Validate the Maximum Value.
  maxValueValidation: function() {
    var mustBeNumeric = new RegExp(/^[\d]+$/),
      maxValue = this.get('pollMaxValue');
    if (Ember.isEmpty(maxValue) || !parseInt(maxValue) || !mustBeNumeric.test(maxValue)) {
      return Discourse.InputValidation.create({ failed: true, reason: I18n.t("template_manager.poll_max_must_be_numeric") });
    }

    return Discourse.InputValidation.create({ok: true});
  }.property('pollMaxValue'),

  // Validate the Step Value.
  stepValueValidation: function() {
    var mustBeNumeric = new RegExp(/^[\d]+$/),
      stepValue = this.get('pollStepValue'),
      intStepValue = parseInt(this.get('pollStepValue')),
      intMaxValue = parseInt(this.get('pollMaxValue'));
    if (Ember.isEmpty(stepValue) || !parseInt(stepValue) || !mustBeNumeric.test(stepValue)) {
      return Discourse.InputValidation.create({ failed: true, reason: I18n.t("template_manager.poll_step_must_be_numeric") });
    }

    if (intStepValue > intMaxValue) {
      return Discourse.InputValidation.create({ failed: true, reason: I18n.t("template_manager.poll_step_must_be_less_than_max") });
    }

    return Discourse.InputValidation.create({ok: true});
  }.property('pollStepValue', 'pollMaxValue'),

  // Validate the Options
  optionsValidation: function() {
    if (this.get("pollType") == "number")
      return Discourse.InputValidation.create({ok: true});

    var options = this.get('pollOptions'),
      numOptions = (options.match(/^(.*)$/gm) || []).length,
      intMinValue = parseInt(this.get('pollMinValue')),
      intMaxValue = parseInt(this.get('pollMaxValue'));

    if (!Ember.isEmpty(this.get("pollOptions")) && numOptions < 2) {
      return Discourse.InputValidation.create({ failed: true, reason: I18n.t("template_manager.poll_options_must_have_two_entries") });
    }

    if (numOptions < intMinValue || numOptions < intMaxValue) {
      return Discourse.InputValidation.create({ failed: true, reason: I18n.t("template_manager.poll_options_must_be_greater_than_min_max_values") });
    }
  }.property('pollType', 'pollOptions', 'pollMinValue', 'pollMaxValue'),

  submitDisabled: function() {
    return false;
  }.property('pollType', 'pollOptions', 'minValueValidation.failed', 'maxValueValidation.failed', 'stepValueValidation.failed', 'optionsValidation.failed'),

  actions: {
    apply: function() {
      var name = this.get("pollName"), type = this.get("pollType"), self = this, composerOutput = "";
      if (type == "regular") {
	composerOutput += "# Regular template:\r\n[] One \r\n []Two \r\n[ ] three";
      }
      else if (type == "stupid") {
        composerOutput += "# Stupid template:\r\n[] Apple \r\n [] Two \r\n[ ] C";
      }
      else if (type == "stupid") {
        composerOutput += "# Stupid template:\r\n[] 1 \r\n [] 2 \r\n[ ] 3";
      }
      else if (type == "multiple") {
        composerOutput += "# Multiple template:\r\n[] A \r\n [] B \r\n[ ] C";
      }
      else {
	  composerOutput += "END OF OPTIONS";
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
    this.setProperties({pollName: "", pollType: "regular", pollMinValue: 1,
      pollMaxValue: 1, pollStepValue: 1, pollOptions: "", pollAnswerValue: "" });
  },

  init: function () {
    this._super();

    this.addObserver("pollType", function() {
      this.refresh();
    }.bind(this));
  }
});
