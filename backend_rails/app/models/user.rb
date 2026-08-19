class User < ApplicationRecord
  self.primary_key = :uid

  has_many :health_profiles, foreign_key: :user_uid, primary_key: :uid, dependent: :destroy

  validates :uid, presence: true, uniqueness: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :privacy_terms_accepted, acceptance: { accept: true }
end
