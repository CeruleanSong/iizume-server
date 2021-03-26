require 'sequel'

Sequel.migration do
	change do
		create_table?(:manga_tag) do
			foreign_key(:manga_id, :manga, { key: 'manga_id', null: false , type: 'varchar(16)' })
			foreign_key(:tag_id, :tag, { key: 'tag_id', null: false , type: 'varchar(16)' })
			primary_key [ :manga_id, :tag_id ]
		end
	end
end