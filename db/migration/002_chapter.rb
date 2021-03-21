require 'sequel'

Sequel.migration do
	change do
		create_table!(:chapter) do
			primary_key :id
			String :chapter_id, null: false, unique: true, size: 16
			String :title, null: false
			String :chapter_n, null: true
			DateTime :upload_date, null: true
			String :scanlator, null: true
			String :page_list, null: true
			column :created, 'timestamp(6)', default: Sequel.function(:CURRENT_TIMESTAMP, 6)
			column :updated, 'timestamp(6)', default: Sequel.function(:CURRENT_TIMESTAMP, 6)
		end
	end

	down do
		drop_table(:chapter)
	end
end