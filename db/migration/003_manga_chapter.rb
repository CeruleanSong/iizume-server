require 'sequel'

Sequel.migration do
	change do
		create_table!(:manga_chapter) do
			String :origin, null: false
			foreign_key :manga_id, :manga
			foreign_key :chapter_id, :chapter
			primary_key [ :manga_id, :chapter_id ]
		end
	end

	down do
		drop_table(:manga_chapter)
	end
end