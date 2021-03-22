module Source
	def self.create(source_id)
		Mangadex.new(source_id)
	end

	class Mangadex
		def initialize(source_id)
			@origin = 'https://mangadex.org'
			@name = 'mangadex'
			@alias = 'mangadex'
			@enabled = false
			@source_id = source_id
		end
		
		def getOrigin
			return @origin
		end
		
		def getName
			return @name
		end
		
		def getAlias
			return @alias
		end

		def isEnabled
			return @enabled
		end
	end
end