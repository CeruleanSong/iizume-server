require 'sequel'

Sequel.migration do
	change do
		create_table!(:chapter) do
			primary_key :id
			String :chapter_id, null: false, unique: true, size: 16
			String :origin, null: false
			String :title, null: false
			String :chapter_n, null: true
			Date :upload_date, null: true
			String :scanlator, null: true
			String :page_list, null: true
		end
	end

	down do
		drop_table(:chapter)
	end
end