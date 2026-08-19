class ScanRecord < ApplicationRecord
  belongs_to :health_profile

  validates :product_name, presence: true
  validates :status, presence: true, inclusion: { in: %w[green yellow red] }
  validates :reason, presence: true
  validates :user_rating, numericality: { only_integer: true, greater_than_or_equal_to: 1, less_than_or_equal_to: 5 }, allow_nil: true
end
