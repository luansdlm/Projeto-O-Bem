class CreateScanRecords < ActiveRecord::Migration[7.1]
  def change
    create_table :scan_records do |t|
      t.references :health_profile, null: false, foreign_key: { on_delete: :cascade }
      t.string :product_name, null: false
      t.string :status, null: false # 'green', 'yellow', 'red'
      t.text :reason, null: false
      t.text :ingredients
      t.integer :user_rating
      t.text :user_comment

      t.timestamps
    end
  end
end
