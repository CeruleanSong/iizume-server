require 'sequel'

Sequel.migration do
	change do
		create_table!(:manga) do
			primary_key :id
			String :manga_id, null: false, unique: true, size: 16
			String :origin, null: false
			String :cover, null: false
			String :title, null: false
			String :author, null: true
			String :artist, null: true
			String :description, null: true, text: true
			String :tags, null: true, text: true
			String :type, null: true
			Date :released, null: true
			String :status_origin, null: true
			String :status_scan, null: true
		end
	end

	down do
	  drop_table(:manga)
	end
  end