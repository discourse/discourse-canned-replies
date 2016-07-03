require "rails_helper"

path = "./plugins/discourse-plugin-template-manager/plugin.rb"
source = File.read(path)
plugin = Plugin::Instance.new(Plugin::Metadata.parse(source), path)
plugin.activate!
plugin.initializers.first.call

describe CannedReply::CannedrepliesController do
  routes { CannedReply::Engine.routes }

  let!(:user) { log_in }

  describe "#cannedreplies" do

    it "adds a reply and lists all replies" do
      user.update(admin: true)
      xhr :post, :create, title: 'Reply test title', content: 'Reply test content'
      expect(response.status).to eq 200

      xhr :get, :index

      expect(response.status).to eq 200
      expect(response.body).to_not eq("{\"replies\":null}")

      replies = JSON.parse(response.body)['replies']
      expect(replies.length).to eq 1

      key, value = replies.first
      expect(value['id']).to eq key
      expect(value['title']).to eq 'Reply test title'
      expect(value['content']).to eq 'Reply test content'
    end

    it "fails to add a reply" do
      xhr :post, :create, title: 'Reply test title', content: 'Reply test content'
      expect(response.status).to_not eq 200
    end

    it "adds and removes a reply" do
      user.update(admin: true)
      xhr :post, :create, title: 'Reply test title', content: 'Reply test content'
      expect(response.status).to eq 200

      reply = JSON.parse(response.body)
      expect(reply).to_not eq(nil)

      id = reply['id']
      expect(id).to_not eq(nil)

      xhr :delete, :remove, reply_id: id
      expect(response.status).to eq 200
    end

    it "fails to remove a reply" do
      user.update(admin: true)
      xhr :post, :create, title: 'Reply test title', content: 'Reply test content'
      expect(response.status).to eq 200

      reply = JSON.parse(response.body)
      expect(reply).to_not eq(nil)

      id = reply['id']
      expect(id).to_not eq(nil)

      user.update(admin: false)

      xhr :delete, :remove, reply_id: id
      expect(response.status).to_not eq 200
    end

    it "creates and edits a reply" do
      user.update(admin: true)
      xhr :post, :create, title: 'Reply test title', content: 'Reply test content'
      expect(response.status).to eq 200

      reply = JSON.parse(response.body)
      expect(reply).to_not eq(nil)

      id = reply['id']
      expect(id).to_not eq(nil)

      xhr :post, :update, reply_id: id, title: 'Edited test title', content: 'Edited test content'
      expect(response.status).to eq 200

      xhr :get, :index
      expect(response.status).to eq 200

      replies = JSON.parse(response.body)['replies']
      expect(replies.length).to eq 1

      key, reply = replies.first
      expect(key).to eq id
      expect(reply).to_not eq(nil)

      expect(reply['title']).to eq('Edited test title')
      expect(reply['content']).to eq('Edited test content')
    end
  end

end
