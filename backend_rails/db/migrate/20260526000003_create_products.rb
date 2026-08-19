class CreateProducts < ActiveRecord::Migration[7.1]
  def change
    create_table :products, id: false do |t|
      t.string :barcode, null: false, primary_key: true # Código EAN/UPC como chave primária
      t.string :name, null: false
      t.string :brand
      t.string :model
      t.string :country
      t.string :language
      t.text :ingredients_text, null: false
      t.text :ingredients_original
      t.text :nutritional_info
      t.datetime :last_processed

      t.timestamps
    end
    add_index :products, :barcode, unique: true
  end
end
