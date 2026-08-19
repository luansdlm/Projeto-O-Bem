class HealthProfile < ApplicationRecord
  belongs_to :user, foreign_key: :user_uid, primary_key: :uid
  has_many :scan_records, dependent: :destroy

  # Garantir serialização de Array via JSON para portabilidade SQLite <-> PostgreSQL
  serialize :conditions, type: Array, coder: JSON
  serialize :allergies, type: Array, coder: JSON

  validates :name, presence: true, length: { minimum: 2 }
  validates :profile_type, presence: true, inclusion: { in: %w[self child other] }

  # Método utilitário de inicialização conveniente
  after_initialize :set_defaults

  private

  def set_defaults
    self.conditions ||= []
    self.allergies ||= []
  end
end
