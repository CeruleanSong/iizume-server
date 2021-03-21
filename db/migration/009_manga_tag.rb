require 'sequel'

Sequel.migration do
	change do
		create_table!(:manga_tag) do
			foreign_key :manga_id, :manga
			foreign_key :tag_id, :tag
			primary_key [ :manga_id, :tag_id ]
		end
	end

	down do
		drop_table(:manga_tag)
	end
end