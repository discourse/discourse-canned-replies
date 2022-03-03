# frozen_string_literal: true

module DiscourseCannedReplies
  class UsageCount < ActiveRecord::Base
    self.table_name = 'discourse_canned_replies_usage_count'

    belongs_to :topic
  end
end
