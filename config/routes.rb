# frozen_string_literal: true

DiscourseCannedReplies::Engine.routes.draw do
  resources :canned_replies, path: "/", only: %i[index create destroy update] do
    member do
      get "reply"
      patch "use"
    end
  end
end

Discourse::Application.routes.draw { mount ::DiscourseCannedReplies::Engine, at: "/canned_replies" }
