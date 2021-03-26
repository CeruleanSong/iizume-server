require 'sequel'

Sequel.migration do
	change do
		create_table?(:job) do
			primary_key(:id, 'int(11)')
			column(:job_id, 'varchar(16)', null: false, unique: true)
			column(:type, 'varchar(64)', null: false)
			column(:target, 'varchar(64)', null: false)
			column(:status, 'varchar(64)', { default: "CREATED", null: false })
			column(:created, 'datetime', { default: Sequel.function(:CURRENT_TIMESTAMP) })
			column(:queue_time, 'datetime', null: true)
			column(:start_time, 'datetime', null: true)
			column(:end_time, 'datetime', null: true)
		end
	end
end