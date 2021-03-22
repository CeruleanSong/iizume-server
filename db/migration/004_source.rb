require 'sequel'

Sequel.migration do
	change do
		create_table?(:source) do
			primary_key :id
			String :source_id, null: false, unique: true, size: 16
			String :origin, unique: true, null: false
			String :name, unique: true, null: false
			String :alias, unique: true, null: false
			TrueClass :enabled, default: false
			column :created, 'timestamp(6)', default: Sequel.function(:CURRENT_TIMESTAMP, 6)
			column :updated, 'timestamp(6)', default: Sequel.function(:CURRENT_TIMESTAMP, 6)
		end
	end

	down do
		drop_table(:source)
	end
end