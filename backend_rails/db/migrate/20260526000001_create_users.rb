class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users, id: false do |t|
      t.string :uid, null: false, primary_key: true # Match Firebase Authentication UID
      t.string :email, null: false
      t.boolean :privacy_terms_accepted, null: false, default: false
      t.string :full_name
      t.string :phone
      t.string :alternative_email

      t.timestamps
    end

    add_index :users, :email, unique: true
  end
end
