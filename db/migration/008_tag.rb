require 'sequel'

Sequel.migration do
	change do
		create_table?(:tag) do
			primary_key :id
			String :name, null: false, unique: true
		end
	end

	down do
	  drop_table(:tag)
	end
  end