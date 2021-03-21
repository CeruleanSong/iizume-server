module Source
	class Scraper
		def initialize
			@origin = 'https://mangadex.org'
			@name = 'mangadex'
			@alias = 'mangadex'
			@enabled = false
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

		def isEnabled
			return @enabled
		end
	end
end