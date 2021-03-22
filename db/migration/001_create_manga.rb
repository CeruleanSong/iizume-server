require 'sequel'

Sequel.migration do
	change do
		create_table?(:manga) do
			primary_key(:id, 'int(11)')
			column(:manga_id, 'varchar(16)', null: false, unique: true)
			column(:origin, 'tinytext')
			column(:cover, 'varchar(32)', null: true)
			column(:title, 'tinytext', null: false)
			column(:author, 'varchar(32)', null: true)
			column(:artist, 'varchar(32)', null: true)
			column(:description, 'text', null: true)
			column(:status_origin, 'varchar(16)', null: true)
			column(:status_scan, 'varchar(16)', null: true)
			column(:released, 'datetime', null: true)
			column(:created, 'datetime', { default: Sequel.function(:CURRENT_TIMESTAMP) })
			column(:updated, 'timestamp', { default: Sequel.function(:CURRENT_TIMESTAMP) })
		end
		
		run("
			CREATE TRIGGER manga_updated
			BEFORE INSERT ON manga
			FOR EACH ROW
			BEGIN
				SET NEW.updated = CURRENT_TIMESTAMP;
			END
		")
	end
  end