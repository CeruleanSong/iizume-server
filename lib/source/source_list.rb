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

				if loaded_module
					source_exists = $DB[:source].select(:alias, :source_id).where(alias: module_name).first
					source_id = source_exists ? source_exists[:source_id] : SecureRandom.hex(8)
					
					@@source_list[module_name] = Source::create(source_id)
					@@source_types.push(module_name)

					if !source_exists
						$DB[:source].insert({
							source_id: source_id,
							origin: @@source_list[module_name].getOrigin,
							title: @@source_list[module_name].getTitle,
							alias: @@source_list[module_name].getAlias,
							enabled: @@source_list[module_name].isEnabled,
						})
					end
				end
			end
		end

		def self.load_module(module_name)
			loaded_module = require_relative "modules/#{module_name}"

			if loaded_module
				source_exists = $DB[:source].select(:alias, :source_id).where(alias: module_name).first
				source_id = source_exists ? source_exists[:source_id] : SecureRandom.hex(8)
				
				@@source_list[module_name] = Source::create(source_id)
				@@source_types.push(module_name)

				if !source_exists
					$DB[:source].insert({
						source_id: source_id,
						origin: @@source_list[module_name].getOrigin,
						title: @@source_list[module_name].getTitle,
						alias: @@source_list[module_name].getAlias,
						enabled: @@source_list[module_name].isEnabled,
					})
				end
			end

			return loaded_module
		end

		def self.getSourceTypes
			@@source_types
		end

		def self.getSourceList
			@@source_list
		end

		def self.getSource(_source)
			@@source_list[_source]
		end
	end
end