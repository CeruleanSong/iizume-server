require 'sequel'

Sequel.migration do
	change do
		create_table?(:manga) do
			primary_key :id
			String :manga_id, null: false, unique: true, size: 16
			String :cover, null: true
			String :title, null: false
			String :author, null: true
			String :artist, null: true
			String :description, null: true, text: true
			String :type, null: true
			DateTime :released, null: true
			String :status_origin, null: true
			String :status_scan, null: true
			column :created, 'timestamp(6)', default: Sequel.function(:CURRENT_TIMESTAMP, 6)
			column :updated, 'timestamp(6)', default: Sequel.function(:CURRENT_TIMESTAMP, 6)
		end
	end

	down do
	  drop_table(:manga)
	end
  end