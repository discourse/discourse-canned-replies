# frozen_string_literal: true

require 'rails_helper'
require_relative '../helpers/topics_helper'

RSpec.configure { |c| c.include DiscourseCannedReplies::TopicsHelper }

describe DiscourseCannedReplies::CannedRepliesController do
  fab!(:admin) { Fabricate(:admin) }
  fab!(:moderator) { Fabricate(:moderator) }
  fab!(:user) { Fabricate(:user) }
  fab!(:user_in_group1) { Fabricate(:user) }
  fab!(:user_in_group2) { Fabricate(:user) }
  fab!(:group1) do
    group = Fabricate(:group)
    group.add(user_in_group1)
    group.save
    group
  end
  fab!(:group2) do
    group = Fabricate(:group)
    group.add(user_in_group2)
    group.save
    group
  end
  fab!(:canned_replies_parent_category) { Fabricate(:category_with_definition) }
  fab!(:canned_replies_sub_category_moderators) do
    Fabricate(
      :private_category_with_definition,
      parent_category_id: canned_replies_parent_category.id,
      group: Group[:moderators]
    )
  end
  fab!(:canned_replies_sub_category_group) do
    Fabricate(
      :private_category_with_definition,
      parent_category_id: canned_replies_parent_category.id,
      group: group1
    )
  end
  fab!(:canned_replies_sub_category_group2) do
    Fabricate(
      :private_category_with_definition,
      parent_category_id: canned_replies_parent_category.id,
      group: group2
    )
  end
  fab!(:canned_replies_sub_category_everyone) do
    Fabricate(
      :category_with_definition,
      parent_category_id: canned_replies_parent_category.id
    )
  end
  fab!(:canned_reply0) do
    Fabricate(:canned_reply, category: canned_replies_parent_category)
  end
  fab!(:canned_reply1) do
    Fabricate(:canned_reply, category: canned_replies_parent_category)
  end
  fab!(:canned_reply2) do
    Fabricate(:canned_reply, category: canned_replies_parent_category)
  end
  fab!(:canned_reply3) do
    Fabricate(:canned_reply, category: canned_replies_sub_category_moderators)
  end
  fab!(:canned_reply4) do
    Fabricate(:canned_reply, category: canned_replies_sub_category_group)
  end
  fab!(:canned_reply5) do
    Fabricate(:canned_reply, category: canned_replies_sub_category_group2)
  end
  fab!(:canned_reply6) do
    Fabricate(:canned_reply, category: canned_replies_sub_category_everyone)
  end
  fab!(:canned_reply7) do
    Fabricate(:canned_reply, category: canned_replies_sub_category_everyone)
  end
  fab!(:other_topic1) { Fabricate(:canned_reply) } # uncategorized
  fab!(:other_topic2) { Fabricate(:canned_reply) } # uncategorized
  fab!(:other_topic3) { Fabricate(:canned_reply) } # uncategorized
  fab!(:tag) do
    Fabricate(
      :tag,
      topics: [canned_reply4],
      categories: [canned_replies_sub_category_moderators],
      name: 'category-tag'
    )
  end
  fab!(:everyone_tag) do
    Fabricate(
      :tag,
      topics: [
        canned_reply0,
        canned_reply1,
        canned_reply2,
        canned_reply6,
        canned_reply7
      ],
      name: 'use-anywhere'
    )
  end
  fab!(:group_tag) do
    Fabricate(:tag, topics: [canned_reply4, canned_reply5], name: 'use-group')
  end

  before { SiteSetting.canned_replies_enabled = true }

  describe '#list' do
    context 'when a regular user is logged' do
      before { sign_in(user) }

      it 'should list topics in the category assigned as canned replies' do
        SiteSetting.canned_replies_category =
          canned_replies_sub_category_everyone.id

        get '/canned_replies'
        expect(response.status).to eq(200)

        parsed = response.parsed_body
        expected_response =
          serialize_topics([canned_reply6, canned_reply7].sort_by(&:title))

        expect(parsed['canned_replies']).to eq(expected_response)
      end

      it 'should list topics in the parent category and subcategories that the user can see' do
        SiteSetting.canned_replies_category = canned_replies_parent_category.id

        get '/canned_replies'
        expect(response.status).to eq(200)

        parsed = response.parsed_body
        expected_response =
          serialize_topics(
            [
              canned_reply0,
              canned_reply1,
              canned_reply2,
              canned_reply6,
              canned_reply7
            ].sort_by(&:title)
          )

        expect(parsed['canned_replies']).to eq(expected_response)
      end

      it "should not be able to use canned replies if can't see topics in the category" do
        SiteSetting.canned_replies_category =
          canned_replies_sub_category_moderators.id

        get '/canned_replies'
        expect(response.status).to eq(403)

        SiteSetting.canned_replies_category =
          canned_replies_sub_category_group.id

        get '/canned_replies'
        expect(response.status).to eq(403)

        SiteSetting.canned_replies_category =
          canned_replies_sub_category_group2.id

        get '/canned_replies'
        expect(response.status).to eq(403)
      end
    end

    context 'when a moderator is logged' do
      before do
        Group.refresh_automatic_groups!(:moderators)
        sign_in(moderator)
      end

      it 'should list topics in the parent category and subcategories that the moderator can see' do
        SiteSetting.canned_replies_category = canned_replies_parent_category.id

        get '/canned_replies'
        expect(response.status).to eq(200)

        parsed = response.parsed_body
        expected_response =
          serialize_topics(
            [
              canned_reply0,
              canned_reply1,
              canned_reply2,
              canned_reply3,
              canned_reply6,
              canned_reply7
            ].sort_by(&:title)
          )

        expect(parsed['canned_replies']).to eq(expected_response)
      end
    end

    context 'when an user belonging to a group is logged' do
      it 'should list topics in the parent category and subcategories that the user can see' do
        SiteSetting.canned_replies_category = canned_replies_parent_category.id

        sign_in(user_in_group1)

        get '/canned_replies'
        expect(response.status).to eq(200)

        parsed = response.parsed_body
        expected_response =
          serialize_topics(
            [
              canned_reply0,
              canned_reply1,
              canned_reply2,
              canned_reply4,
              canned_reply6,
              canned_reply7
            ].sort_by(&:title)
          )

        expect(parsed['canned_replies']).to eq(expected_response)

        sign_in(user_in_group2)

        get '/canned_replies'
        expect(response.status).to eq(200)

        parsed = response.parsed_body
        expected_response =
          serialize_topics(
            [
              canned_reply0,
              canned_reply1,
              canned_reply2,
              canned_reply5,
              canned_reply6,
              canned_reply7
            ].sort_by(&:title)
          )

        expect(parsed['canned_replies']).to eq(expected_response)
      end
    end

    context 'when an admin is logged' do
      before do
        SiteSetting.canned_replies_category = canned_replies_parent_category.id

        sign_in(admin)
        Group.refresh_automatic_groups!
      end

      it 'should list topics in the parent category and subcategories that the admin can see' do
        get '/canned_replies'
        expect(response.status).to eq(200)

        parsed = response.parsed_body
        expected_response =
          serialize_topics(
            [
              canned_reply0,
              canned_reply1,
              canned_reply2,
              canned_reply3,
              canned_reply4,
              canned_reply5,
              canned_reply6,
              canned_reply7
            ].sort_by(&:title)
          )

        expect(parsed['canned_replies']).to eq(expected_response)
      end

      it 'should not list delete, archived and unlisted topics' do
        canned_reply0.trash!(admin)
        expect(canned_reply0.deleted_at).not_to eq(nil)

        canned_reply1.update_attribute :archived, true
        expect(canned_reply1).to be_archived

        canned_reply2.update_status('visible', false, admin)
        canned_reply2.reload
        expect(canned_reply2).not_to be_visible

        get '/canned_replies'
        expect(response.status).to eq(200)

        parsed = response.parsed_body
        expected_response =
          serialize_topics(
            [
              canned_reply3,
              canned_reply4,
              canned_reply5,
              canned_reply6,
              canned_reply7
            ].sort_by(&:title)
          )

        expect(parsed['canned_replies']).to eq(expected_response)
      end
    end

    context 'when no user is signed in' do
      it 'should return 404' do
        SiteSetting.canned_replies_category =
          canned_replies_sub_category_everyone.id

        get '/canned_replies'
        expect(response.status).to eq(404)
      end
    end
  end

  describe '#use' do
    context 'when a canned reply is used' do
      before do
        SiteSetting.canned_replies_category =
          canned_replies_sub_category_moderators.id

        Group.refresh_automatic_groups!(:moderators)
        sign_in(moderator)
      end

      it 'it should increment usage count' do
        get '/canned_replies'
        expect(response.status).to eq(200)

        parsed = response.parsed_body
        expected_response = serialize_topics([canned_reply3])

        expect(parsed['canned_replies']).to eq(expected_response)
        expect(parsed['canned_replies'][0]['usages']).to eq(0)

        post "/canned_replies/#{canned_reply3.id}/use"
        expect(response.status).to eq(200)

        get '/canned_replies'
        expect(response.status).to eq(200)

        parsed = response.parsed_body

        canned_reply3.reload
        expected_response = serialize_topics([canned_reply3])

        expect(parsed['canned_replies']).to eq(expected_response)
        expect(parsed['canned_replies'][0]['usages']).to eq(1)
      end
    end
  end
end
