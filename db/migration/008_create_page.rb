require 'sequel'

Sequel.migration do
	change do
		create_table?(:page) do
			primary_key(:id, 'int(11)')
			column(:page_id, 'varchar(16)', null: false, unique: true)
			column(:origin, 'varchar(256)', null: false, unique: true)
			column(:image, 'tinytext')
			column(:page_n, 'float(3)')
			column :created, 'timestamp(6)', default: Sequel.function(:CURRENT_TIMESTAMP, 6)
			column :updated, 'timestamp(6)', default: Sequel.function(:CURRENT_TIMESTAMP, 6)
		end
		
		run("
			CREATE TRIGGER page_updated
			BEFORE INSERT ON page
			FOR EACH ROW
			BEGIN
				SET NEW.updated = CURRENT_TIMESTAMP;
			END
		")
	end
end