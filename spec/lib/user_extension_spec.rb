# frozen_string_literal: true

require "rails_helper"

describe DiscourseCannedReplies::UserExtension do
  fab!(:moderator) { Fabricate(:moderator) }
  fab!(:user) { Fabricate(:user) }
  fab!(:canned_replies_category) { Fabricate(:category_with_definition) }
  fab!(:canned_replies_private_category) { Fabricate(:private_category_with_definition, group: Group[:moderators]) }

  context 'can_use_canned_replies?' do
    before do
      Group.refresh_automatic_groups!(:moderators)
    end

    it "is false when SiteSetting.canned_replies_category is empty" do
      SiteSetting.canned_replies_category = ""
      expect(moderator.can_use_canned_replies?).to eq(false)
      expect(user.can_use_canned_replies?).to eq(false)
    end

    it "is false when SiteSetting.canned_replies_category points to category that does not exist" do
      SiteSetting.canned_replies_category = -99999
      expect(moderator.can_use_canned_replies?).to eq(false)
      expect(user.can_use_canned_replies?).to eq(false)
    end

    it "is true when user can access category" do
      SiteSetting.canned_replies_category = canned_replies_category.id
      expect(moderator.can_use_canned_replies?).to eq(true)
      expect(user.can_use_canned_replies?).to eq(true)
    end

    it "is false when user can't access category" do
      SiteSetting.canned_replies_category = canned_replies_private_category.id
      expect(user.can_use_canned_replies?).to eq(false)
    end
  end
end
