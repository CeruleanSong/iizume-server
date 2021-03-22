require 'sequel'

Sequel.migration do
	change do
		create_table?(:source_manga) do
			String :origin, null: false
			foreign_key :source_id, :source
			foreign_key :manga_id, :manga
			primary_key [ :source_id, :manga_id ]
		end
	end

	down do
		drop_table(:source_manga)
	end
end