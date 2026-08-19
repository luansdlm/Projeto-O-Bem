class CreateHealthProfiles < ActiveRecord::Migration[7.1]
  def change
    create_table :health_profiles do |t|
      t.string :user_uid, null: false # Referência ao UID do usuário criador (Firebase)
      t.string :name, null: false
      t.string :profile_type, null: false, default: 'self' # 'self', 'child', 'other'
      
      # Armazenar restrições sob estrutura jsonb para flexibilidade entre PostgreSQL/SQLite
      t.jsonb :conditions, null: false, default: []
      t.jsonb :allergies, null: false, default: []

      t.timestamps
    end

    add_foreign_key :health_profiles, :users, column: :user_uid, primary_key: :uid, on_delete: :cascade
    add_index :health_profiles, :user_uid
  end
end
