require 'net/http'
require 'uri'
require 'ferrum'
require 'json'
require 'securerandom'

require_relative '../../db/db_connection'
require_relative '../../db/model/source'

module Source
	class SourceList
		@@source_list = Hash.new
		@@source_types = Array.new
		
		def self.load_modules
			mod = `ls lib/source/modules`
			mod.split(' ').each do|file|
				module_name = file.split('.')[0]
				loaded_module = require_relative "modules/#{module_name}"
				@@source_list[module_name] = Source::Scraper.new
				@@source_types.push(module_name)

				source_exists = $DB[:source].select(:alias).where(alias: @@source_list[module_name].getAlias)
				if !source_exists.first
					new_source = Model::Source.new({
						source_id: SecureRandom.hex(8),
						origin: @@source_list[module_name].getOrigin,
						name: @@source_list[module_name].getName,
						alias: @@source_list[module_name].getAlias
					}).save
				end
			end
		end

		def self.getSourceList
			@@source_list
		end

		def self.getSourceTypes
			@@source_types
		end
	end
end