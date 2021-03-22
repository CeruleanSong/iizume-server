require 'sequel'

Sequel.migration do
	change do
		create_table?(:source_manga) do
			foreign_key(:source_id, :source, { key: 'source_id', null: false , type: 'varchar(16)' })
			foreign_key(:manga_id, :manga, { key: 'manga_id', null: false , type: 'varchar(16)', unique: true })
			primary_key [ :source_id, :manga_id ]
		end
	end
end