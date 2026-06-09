#!/usr/bin/env ruby
# frozen_string_literal: true

require "spaceship"

APP_ID = ENV.fetch("ASC_APP_ID", "6778319382")
APP_VERSION = ENV.fetch("APP_VERSION", "1.0.0")
BUILD_NUMBER = ARGV[0] || ENV.fetch("BUILD_NUMBER", "2")
GROUP_NAME = ARGV[1] || ENV.fetch("TESTFLIGHT_GROUP", "External Testing")
PUBLIC_LINK_LIMIT = Integer(ENV.fetch("TESTFLIGHT_PUBLIC_LINK_LIMIT", "1000"))

APPROVED_EXTERNAL_STATES = %w[BETA_APPROVED IN_BETA_TESTING READY_FOR_BETA_TESTING].freeze

def abort_with(message)
  warn(message)
  exit 1
end

def app_store_token
  key_id = ENV.fetch("APP_STORE_CONNECT_KEY_ID", "X5SX4S7NW5")
  issuer_id = ENV.fetch("APP_STORE_CONNECT_ISSUER_ID", "4827880b-e626-4e8e-a16b-c66db4355e12")
  key_path = ENV.fetch(
    "APP_STORE_CONNECT_KEY_FILEPATH",
    File.expand_path("~/.appstoreconnect/private_keys/AuthKey_#{key_id}.p8")
  )

  abort_with("App Store Connect key file not found: #{key_path}") unless File.exist?(key_path)

  Spaceship::ConnectAPI::Token.create(
    key_id: key_id,
    issuer_id: issuer_id,
    filepath: key_path,
    duration: 1200,
    in_house: false
  )
end

Spaceship::ConnectAPI.token = app_store_token

app = Spaceship::ConnectAPI::App.get(app_id: APP_ID)
abort_with("Could not find App Store Connect app #{APP_ID}") unless app

build = Spaceship::ConnectAPI::Build.all(
  app_id: APP_ID,
  version: APP_VERSION,
  build_number: BUILD_NUMBER,
  platform: "IOS",
  includes: "app,buildBetaDetail,betaAppReviewSubmission,preReleaseVersion",
  limit: 1
).first
abort_with("Could not find build #{APP_VERSION} (#{BUILD_NUMBER})") unless build

detail = build.build_beta_detail
review = build.beta_app_review_submission
external_state = detail&.external_build_state || "UNKNOWN"
internal_state = detail&.internal_build_state || "UNKNOWN"
review_state = review&.beta_review_state || "NONE"

puts "Build: #{APP_VERSION} (#{BUILD_NUMBER})"
puts "Internal TestFlight state: #{internal_state}"
puts "External TestFlight state: #{external_state}"
puts "Beta review state: #{review_state}"

unless APPROVED_EXTERNAL_STATES.include?(external_state)
  puts "Public link not enabled yet: external beta is not approved/testing."
  exit 2
end

groups = app.get_beta_groups
external_groups = groups.reject(&:is_internal_group)
group = external_groups.find { |candidate| candidate.name == GROUP_NAME } || external_groups.first

unless group
  group = app.create_beta_group(
    group_name: GROUP_NAME,
    public_link_enabled: true,
    public_link_limit_enabled: true,
    public_link_limit: PUBLIC_LINK_LIMIT
  )
end

puts "External group: #{group.name} (#{group.id})"
build.add_beta_groups(beta_groups: [group])

unless group.public_link_enabled
  group = group.update(
    attributes: {
      public_link_enabled: true,
      public_link_limit_enabled: true,
      public_link_limit: PUBLIC_LINK_LIMIT
    }
  )
end

group = app.get_beta_groups.find { |candidate| candidate.id == group.id } || group

if group.public_link.to_s.empty?
  puts "Public link enabled, but Apple has not returned the URL yet."
  exit 3
end

puts "Public TestFlight link: #{group.public_link}"
