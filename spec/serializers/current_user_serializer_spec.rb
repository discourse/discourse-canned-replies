# frozen_string_literal: true

require "rails_helper"

describe CurrentUserSerializer, type: :serializer do
  subject(:serializer) { described_class.new(user, scope: guardian, root: false) }

  let(:guardian) { Guardian.new }

  context "CurrentUserSerializer extension" do
    fab!(:user) { Fabricate(:user) }

    it "includes can_use_canned_replies in serialization" do
      json = serializer.as_json
      expect(json).to have_key(:can_use_canned_replies)
    end
  end
end
