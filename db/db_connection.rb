require 'rom'
require 'mysql2'
require 'yaml'

config = YAML.load(File.read("db/db_config.yml"))
connection_url = "mysql2://#{config['database']['url']}:#{config['database']['port']}/#{config['database']['schema']}"

config = ROM::Configuration.new(:sql, connection_url, config['options'])
if config
	puts "connected to: #{connection_url}"
else
	puts "connection failed"
end