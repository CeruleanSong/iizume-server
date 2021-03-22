require 'sequel'

Sequel.migration do
	change do
		create_table?(:tag) do
			primary_key(:id, 'int(11)')
			column(:tag_id, 'varchar(16)', { null: false, unique: true })
			column(:title, 'varchar(16)', null: false, unique: true)
		end
	end
end