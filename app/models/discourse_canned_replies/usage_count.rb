# frozen_string_literal: true

module DiscourseCannedReplies
  class UsageCount < ActiveRecord::Base
    self.table_name = 'discourse_canned_replies_usage_count'

    belongs_to :topic

    validates_presence_of :topic_id
  end
end
