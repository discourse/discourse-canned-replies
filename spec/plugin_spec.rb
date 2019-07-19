# frozen_string_literal: true

require "rails_helper"

describe CannedReply do
  let(:user) { Fabricate(:user) }
  let(:admin) { Fabricate(:admin) }
  let(:group) { Fabricate(:group) }

  before do
    SiteSetting.canned_replies_groups = group.name
  end

  it 'works for staff and users in group' do
    expect(admin.can_use_canned_replies?).to eq(true)
    expect(user.can_use_canned_replies?).to eq(false)

    group.add(user)
    expect(user.reload.can_use_canned_replies?).to eq(true)
  end
end
