# frozen_string_literal: true

module DiscourseCannedReplies::TopicsHelper
  def serialize_topics(topics)
    JSON.parse(
      ActiveModel::ArraySerializer.new(
        topics,
        each_serializer: DiscourseCannedReplies::CannedRepliesSerializer
      ).to_json
    )
  end
end
