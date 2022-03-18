# frozen_string_literal: true

require 'rails_helper'
require_relative '../helpers/topics_helper'

RSpec.configure { |c| c.include DiscourseCannedReplies::TopicsHelper }

describe DiscourseCannedReplies::TopicQueryExtension do
  fab!(:user) { Fabricate(:user) }
  fab!(:unrelated_category) { Fabricate(:category_with_definition) }
  fab!(:unrelated_topic) { Fabricate(:topic, category: unrelated_category) }
  fab!(:canned_replies_category) { Fabricate(:category_with_definition) }
  fab!(:canned_replies) do
    Fabricate.times(
      100,
      :random_canned_reply,
      category: canned_replies_category
    )
  end

  context 'list_canned_replies' do
    before { SiteSetting.canned_replies_category = canned_replies_category.id }

    it 'raises an error when SiteSetting.canned_replies_category is not set' do
      SiteSetting.canned_replies_category = ''
      expect { TopicQuery.new(user).list_canned_replies }.to raise_error(
        Discourse::SiteSettingMissing
      )
    end

    it 'retrieves all topics' do
      topics = TopicQuery.new(user).list_canned_replies.topics
      expect(topics.size).to eq(canned_replies.size)
    end

    it 'filter out the category description topic' do
      expect(canned_replies_category.topic_id).not_to eq(nil)

      topics = TopicQuery.new(user).list_canned_replies.topics
      topics_without_category_description =
        topics.filter { |topic| topic.id != canned_replies_category.topic_id }

      expect(topics.size).to eq(topics_without_category_description.size)
    end

    it 'retrieves closed topics' do
      topics = TopicQuery.new(user).list_canned_replies.topics
      expect(topics.size).to eq(canned_replies.size)

      closed_replies = canned_replies.sample(canned_replies.size * 0.2)
      expect(topics.size).not_to eq(closed_replies.size)

      closed_replies.each { |reply| reply.update_status('closed', true, user) }

      topics = TopicQuery.new(user).list_canned_replies.topics
      expect(topics.size).to eq(canned_replies.size)
    end

    it 'filter out unlisted topics' do
      topics = TopicQuery.new(user).list_canned_replies.topics
      expect(topics.size).to eq(canned_replies.size)

      unlisted_replies = canned_replies.sample(canned_replies.size * 0.15)
      expect(topics.size).not_to eq(unlisted_replies.size)

      unlisted_replies.each do |reply|
        reply.update_status('visible', false, user)
      end

      topics = TopicQuery.new(user).list_canned_replies.topics
      expect(topics.size).to eq(canned_replies.size - unlisted_replies.size)
    end

    it 'filter out archived topics' do
      topics = TopicQuery.new(user).list_canned_replies.topics
      expect(topics.size).to eq(canned_replies.size)

      archived_replies = canned_replies.sample(canned_replies.size * 0.25)
      expect(topics.size).not_to eq(archived_replies.size)

      archived_replies.each { |reply| reply.update_attribute :archived, true }

      topics = TopicQuery.new(user).list_canned_replies.topics
      expect(topics.size).to eq(canned_replies.size - archived_replies.size)
    end

    it 'filter out deleted topics' do
      topics = TopicQuery.new(user).list_canned_replies.topics
      expect(topics.size).to eq(canned_replies.size)

      deleted_replies = canned_replies.sample(canned_replies.size * 0.2)
      expect(topics.size).not_to eq(deleted_replies.size)

      deleted_replies.each { |reply| reply.trash! }

      topics = TopicQuery.new(user).list_canned_replies.topics
      expect(topics.size).to eq(canned_replies.size - deleted_replies.size)
    end

    it 'sorts retrieved replies by title' do
      sorted_replies = canned_replies.sort_by(&:title)
      expect(sorted_replies).not_to eq(canned_replies)

      topics = TopicQuery.new(user).list_canned_replies.topics
      expect(topics).to eq(sorted_replies)
    end
  end
end
