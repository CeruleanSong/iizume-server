module Source
	class Scraper
		def initialize
			@origin = 'https://www.mangatown.com'
			@name = 'mangatown'
			@alias = 'mangatown'
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
	end
end