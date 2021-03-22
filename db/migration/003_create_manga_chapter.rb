require 'sequel'

Sequel.migration do
	change do
		create_table?(:manga_chapter) do
			foreign_key(:manga_id, :manga, { key: 'manga_id', null: false , type: 'varchar(16)' })
			foreign_key(:chapter_id, :chapter, { key: 'chapter_id', null: false , type: 'varchar(16)', unique: true })
			primary_key [ :manga_id, :chapter_id ]
		end
	end
end