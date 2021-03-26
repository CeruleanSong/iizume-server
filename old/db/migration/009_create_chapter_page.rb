require 'sequel'

Sequel.migration do
	change do
		create_table?(:chapter_page) do
			foreign_key(:chapter_id, :chapter, { key: 'chapter_id', null: false , type: 'varchar(16)' })
			foreign_key(:page_id, :page, { key: 'page_id', null: false , type: 'varchar(16)', unique: true })
			primary_key [ :chapter_id, :page_id ]
		end
	end
end