require 'sequel'

Sequel.migration do
	change do
		create_table!(:manga_chapter) do
			foreign_key :manga_id, :manga
			foreign_key :chapter_id, :chapter
		end
	end

	down do
		drop_table(:manga_chapter)
	end
end