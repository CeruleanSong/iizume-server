module Source
	def self.create(source_id)
		Mangatown.new(source_id)
	end

	class Mangatown
		def initialize(source_id)
			@origin = 'https://www.mangatown.com'
			@title = 'mangatown'
			@alias = 'mangatown'
			@enabled = false
			@source_id = source_id
		end
		
		def getOrigin
			return @origin
		end
		
		def getTitle
			return @title
		end
		
		def getAlias
			return @alias
		end

		def isEnabled
			return @enabled
		end
	end
end