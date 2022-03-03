# frozen_string_literal: true

module DiscourseCannedReplies
  module TopicExtension
    def self.prepended(base)
      base.has_one :canned_reply_usage, class_name: 'DiscourseCannedReplies::UsageCount', dependent: :destroy
    end

    def canned_reply_usage_count
      self.canned_reply_usage&.usage_count.to_i
    end

    def increment_canned_reply_usage_count!
      DB.exec(<<~SQL, topic_id: self.id)
        INSERT INTO discourse_canned_replies_usage_count AS uc
        (topic_id, usage_count, created_at, updated_at)
        VALUES
        (:topic_id, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (topic_id) DO UPDATE SET
          usage_count = uc.usage_count + 1,
          updated_at = CURRENT_TIMESTAMP
          WHERE uc.topic_id = :topic_id
      SQL
    end
  end
end
