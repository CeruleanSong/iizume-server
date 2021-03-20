module Source
	class Scraper
		def initialize
			@origin = 'https://mangadex.org'
			@name = 'mangadex'
			@alias = 'mangadex'
		end
		
		def getOperations
			{
				
			}
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