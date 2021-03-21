require 'sequel'

Sequel.migration do
	change do
		create_table!(:source) do
			primary_key :id
			String :origin, null: false
			String :name, null: false
			String :alias, null: false
		end
	end

	down do
	drop_table(:source)
	end
end