require 'sequel'

Sequel.migration do
	change do
		create_table!(:source_manga) do
			foreign_key :source_id, :source
			foreign_key :manga_id, :manga
		end
	end

	down do
		drop_table(:source_manga)
	end
end