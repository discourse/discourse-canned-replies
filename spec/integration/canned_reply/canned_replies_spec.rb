require "rails_helper"

RSpec.describe CannedReply::CannedRepliesController do
  let(:moderator) do
    user = Fabricate(:moderator)
    sign_in(user)
    user
  end

  let(:privileged_group) do
    group = Fabricate(:group, users: [privileged_user])
    group.add(privileged_user)
    group.save
    group
  end

  let(:privileged_user) do
    user = Fabricate(:user)
    sign_in(user)
    user
  end

  let(:user) do
    user = Fabricate(:user)
    sign_in(user)
    user
  end

  let(:canned_reply) { CannedReply::Reply.add(moderator, 'some title', 'some content') }

  describe 'listing canned replies' do
    context 'as a normal user' do
      it 'should raise the right error' do
        user

        post '/canned_replies'
        expect(response.status).to eq(404)
      end
    end

    let(:list_canned_replies) do
      post '/canned_replies', params: {
        title: 'Reply test title', content: 'Reply test content'
      }

      expect(response).to be_successful

      get '/canned_replies'

      expect(response).to be_successful

      replies = JSON.parse(response.body)["replies"]
      reply = replies.first

      expect(replies.length).to eq(1)
      expect(reply['title']).to eq 'Reply test title'
      expect(reply['content']).to eq 'Reply test content'
    end

    context 'as a staff' do
      it "should list all replies correctly" do
        moderator

        list_canned_replies
      end
    end

    context 'as a privileged user' do

      before do
        privileged_user
        privileged_group
        SiteSetting.canned_replies_groups = privileged_group.name
      end

      it "should list all replies correctly" do
        list_canned_replies
      end
    end
  end

  describe 'removing canned replies' do
    context 'as a normal user' do
      it 'should raise the right error' do
        user

        delete '/canned_replies/someid'
        expect(response.status).to eq(404)
      end
    end

    let(:remove_canned_replies) do
      post '/canned_replies', params: {
        title: 'Reply test title', content: 'Reply test content'
      }

      expect(response).to be_successful

      id, _new_reply = PluginStore.get(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME).first

      delete "/canned_replies/#{id}"

      expect(response).to be_successful
      expect(PluginStore.get(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME)).to eq({})
    end

    context 'as a staff' do
      it 'should be able to remove reply' do
        moderator

        remove_canned_replies
      end
    end
    context 'as a privileged user' do

      before do
        privileged_user
        privileged_group
        SiteSetting.canned_replies_groups = privileged_group.name
      end

      it 'should be able to remove reply' do
        remove_canned_replies
      end
    end
  end

  describe 'editing a canned reply' do
    context 'as a normal user' do
      it 'should raise the right error' do
        user

        put '/canned_replies/someid'
        expect(response.status).to eq(404)
      end
    end

    let(:edit_canned_reply) do
      post '/canned_replies', params: {
        title: 'Reply test title', content: 'Reply test content'
      }

      expect(response).to be_successful

      id, _new_reply = PluginStore.get(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME).first

      put "/canned_replies/#{id}", params: {
        title: 'new title', content: 'new content'
      }

      expect(response).to be_successful

      id, reply = PluginStore.get(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME).first

      expect(reply["title"]).to eq('new title')
      expect(reply["content"]).to eq('new content')
    end

    context 'as a staff' do
      it 'should be able to edit a reply' do
        moderator

        edit_canned_reply
      end
    end
    context 'as a privileged user' do

      before do
        privileged_user
        privileged_group
        SiteSetting.canned_replies_groups = privileged_group.name
      end

      it 'should be able to edit a reply' do
        edit_canned_reply
      end
    end
  end

  describe 'recording canned replies usages' do
    context 'as a normal user' do
      it 'should raise the right error' do
        canned_reply
        user

        patch "/canned_replies/#{canned_reply[:id]}/use"
        expect(response.status).to eq(404)
      end
    end

    context 'as a staff' do
      it 'should be able to record a usage' do
        patch "/canned_replies/#{canned_reply[:id]}/use"

        expect(response).to be_successful

        _id, reply = PluginStore.get(CannedReply::PLUGIN_NAME, CannedReply::STORE_NAME).first

        expect(reply["usages"]).to eq(1)
      end
    end
  end

  describe 'retrieving a canned reply' do
    context 'as a normal user' do
      it 'should raise the right error' do
        canned_reply
        user

        get "/canned_replies/#{canned_reply[:id]}/reply"
        expect(response.status).to eq(404)
      end
    end

    context 'as a staff' do
      it 'should fetch the right canned reply' do
        get "/canned_replies/#{canned_reply[:id]}/reply"

        expect(response).to be_successful

        reply = JSON.parse(response.body)

        expect(reply["title"]).to eq(canned_reply[:title])
        expect(reply["content"]).to eq(canned_reply[:content])
      end
    end
  end
end
