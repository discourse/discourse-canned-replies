# frozen_string_literal: true

module DiscourseCannedReplies
  # frozen_string_literal: true
  class CannedRepliesSerializer < ApplicationSerializer
    attributes :id, :title, :content, :tags, :usages

    def content
      object.first_post.raw
    end

    def tags
      object.tags.map(&:name)
    end

    def usages
      object.canned_reply_usage_count
    end
  end
end
