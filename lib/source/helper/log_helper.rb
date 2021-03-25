require 'securerandom'
require 'json'

module Helper
	module Log
		def Log.create_log(payload)
			timestamp = Time.now
			File.open("logs/#{timestamp.to_i}_#{SecureRandom.hex(8)}_all.json", 'w') do |f|
				f << JSON.pretty_generate({
					time: timestamp,
					completed: payload
				})
			end
		end

		def Log.create_fail_log(payload)
			timestamp = Time.now
			File.open("logs/#{timestamp.to_i}_#{SecureRandom.hex(8)}_fail.json", 'w') do |f|
				f << payload
			end
		end
	end
end