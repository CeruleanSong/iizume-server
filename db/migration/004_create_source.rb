require 'sequel'

Sequel.migration do
	change do
		create_table?(:source) do
			primary_key(:id, 'int(11)')
			column(:source_id, 'varchar(16)', { null: false, unique: true })
			column(:origin, 'tinytext')
			column(:title, 'tinytext')
			column(:alias, 'tinytext')
			column(:enabled, 'bit', { default: 0 })
			column(:created, 'datetime', { default: Sequel.function(:CURRENT_TIMESTAMP) })
			column(:updated, 'timestamp', { default: Sequel.function(:CURRENT_TIMESTAMP) })
		end

		run("
			CREATE TRIGGER source_updated
			BEFORE INSERT ON source
			FOR EACH ROW
			BEGIN
				SET NEW.updated = CURRENT_TIMESTAMP;
			END
		")
	end
end