class Product < ApplicationRecord
  self.primary_key = :barcode

  validates :barcode, presence: true, uniqueness: true
  validates :name, presence: true
  validates :ingredients_text, presence: true

  before_save :set_last_processed

  private

  def set_last_processed
    self.last_processed ||= Time.current
  end
end
