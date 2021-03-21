require 'sequel'

Sequel.migration do
	change do
		create_table!(:source) do
			primary_key :id
			String :source_id, null: false, unique: true, size: 16
			String :origin, unique: true, null: false
			String :name, unique: true, null: false
			String :alias, unique: true, null: false
		end
	end

	down do
		drop_table(:source)
	end
end