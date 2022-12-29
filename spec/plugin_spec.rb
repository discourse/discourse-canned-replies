# frozen_string_literal: true

require "rails_helper"

describe CannedReply do
  let(:user) { Fabricate(:user) }
  let(:admin) { Fabricate(:admin) }
  let(:group) { Fabricate(:group) }

  it "works for staff and users in group" do
    SiteSetting.canned_replies_groups = group.name
    expect(admin.can_use_canned_replies?).to eq(true)
    expect(user.can_use_canned_replies?).to eq(false)

    group.add(user)
    expect(user.reload.can_use_canned_replies?).to eq(true)
  end

  it "works for everyone when enabled" do
    expect(user.can_use_canned_replies?).to eq(false)

    SiteSetting.canned_replies_everyone_enabled = true
    expect(user.reload.can_use_canned_replies?).to eq(true)
  end

  it "allows everyone to edit when enabled" do
    expect(user.can_edit_canned_replies?).to eq(false)

    SiteSetting.canned_replies_everyone_can_edit = true
    expect(user.reload.can_edit_canned_replies?).to eq(true)
  end
end
