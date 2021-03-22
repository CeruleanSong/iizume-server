require 'net/http'
require 'uri'
require 'ferrum'
require 'json'
require 'securerandom'

module Source
	class SourceList
		@@source_list = Hash.new
		@@source_types = Array.new
		
		def self.load_modules
			mod = `ls lib/source/modules`
			mod.split(' ').each do|file|
				module_name = file.split('.')[0]
				
				loaded_module = require_relative "modules/#{module_name}"

				source_exists = $DB[:source].select(:alias, :source_id).where(alias: module_name)
				source_id = ""
				if source_exists.first
					source_id = source_exists.first[:source_id]
				else
					source_id = SecureRandom.hex(8)
				end

				@@source_list[module_name] = Source::create(source_id)
				@@source_types.push(module_name)

				if !source_exists.first
					new_source = Model::Source.new({
						source_id: source_id,
						origin: @@source_list[module_name].getOrigin,
						name: @@source_list[module_name].getName,
						alias: @@source_list[module_name].getAlias,
						enabled: @@source_list[module_name].isEnabled,
					}).save
				end
			end
		end

		def self.getSourceList
			@@source_list
		end

		def self.getSource(_source)
			@@source_list[_source]
		end

		def self.getSourceTypes
			@@source_types
		end
	end
end