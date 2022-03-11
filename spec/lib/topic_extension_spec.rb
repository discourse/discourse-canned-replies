# frozen_string_literal: true

require "rails_helper"

describe DiscourseCannedReplies::TopicExtension do
  fab!(:topic) { Fabricate(:topic) }

  describe Topic, type: :model do
    it { is_expected.to have_one :canned_reply_usage }
  end

  context 'canned_reply_usage_count' do
    it "retrieves usage count as expected" do
      expect(topic.canned_reply_usage_count).to eq(0)
    end
  end

  context 'increment_canned_reply_usage_count!' do
    it "increments usage count as expected" do
      expect(topic.canned_reply_usage_count).to eq(0)

      topic.increment_canned_reply_usage_count!
      topic.reload

      expect(topic.canned_reply_usage_count).to eq(1)

      topic.increment_canned_reply_usage_count!
      topic.reload

      expect(topic.canned_reply_usage_count).to eq(2)

      topic.increment_canned_reply_usage_count!
      topic.reload

      expect(topic.canned_reply_usage_count).to eq(3)
    end
  end
end
