module Source
	class SourceList
		@@source_list = Hash.new
		@@source_types = Array.new
		
		def self.load_modules
			mod = `ls lib/source/modules`
			mod.split(' ').each do|file|
				module_name = file.split('.')[0]
				loaded_module = require_relative "sources/#{module_name}"
				@@source_list[module_name] = Source::Scraper.new
				@@source_types.push(module_name)
			end
		end
	end
end