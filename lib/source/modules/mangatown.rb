module Source
	def self.create(source_id)
		Mangatown.new(source_id)
	end

	class Mangatown
		def initialize(source_id)
			@origin = 'https://www.mangatown.com'
			@name = 'mangatown'
			@alias = 'mangatown'
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