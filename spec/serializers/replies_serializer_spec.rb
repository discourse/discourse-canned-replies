# frozen_string_literal: true

require 'rails_helper'
require_relative '../helpers/topics_helper'

RSpec.configure { |c| c.include DiscourseCannedReplies::TopicsHelper }

describe DiscourseCannedReplies::CannedRepliesSerializer do
  fab!(:canned_reply) { Fabricate(:canned_reply) } # uncategorized
  fab!(:tag1) { Fabricate(:tag, topics: [canned_reply], name: 'tag1') }
  fab!(:tag2) { Fabricate(:tag, topics: [canned_reply], name: 'tag2') }

  subject(:serializer) { described_class.new(canned_reply, root: false) }

  context 'when serializing canned replies' do
    it 'serializes correctly to json including tags when tagging is enabled' do
      SiteSetting.tagging_enabled = true

      json = serializer.as_json
      expect(json).to have_key(:tags)

      expect(json[:id]).to eq(canned_reply.id)
      expect(json[:title]).to eq(canned_reply.title)
      expect(json[:content]).to eq(canned_reply.first_post.raw)
      expect(json[:tags]).to eq(canned_reply.tags.map(&:name))
      expect(json[:usages]).to eq(0)
    end

    it 'serializes correctly to json excluding tags when tagging is disabled' do
      SiteSetting.tagging_enabled = false

      json = serializer.as_json
      expect(json).to_not have_key(:tags)

      expect(json[:id]).to eq(canned_reply.id)
      expect(json[:title]).to eq(canned_reply.title)
      expect(json[:content]).to eq(canned_reply.first_post.raw)
      expect(json[:tags]).to eq(nil)
      expect(json[:usages]).to eq(0)
    end
  end
end
