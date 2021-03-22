require 'sequel'

Sequel.migration do
	change do
		create_table?(:source) do
			primary_key(:id, 'int(11)')
			column(:source_id, 'varchar(16)', { null: false, unique: true })
			column(:origin, 'varchar(32)')
			column(:title, 'tinytext')
			column(:alias, 'float(3)')
			column(:enabled, 'bit', { default: 0, unique: true })
			column(:created, 'datetime', { default: Sequel.function(:CURRENT_TIMESTAMP) })
			column(:updated, 'timestamp', { default: Sequel.function(:CURRENT_TIMESTAMP) })
		end
	end
end