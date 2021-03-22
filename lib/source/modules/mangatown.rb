module Source
	def self.create
		Mangatown.new
	end

	class Mangatown
		def initialize
			@origin = 'https://www.mangatown.com'
			@name = 'mangatown'
			@alias = 'mangatown'
			@enabled = false
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