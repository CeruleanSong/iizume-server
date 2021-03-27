require 'json'

LOG_DIR = 'module/logs/'
Dir.mkdir(LOG_DIR) unless File.exists?(LOG_DIR)

module Log
	def Log.create_log(payload)
		timestamp = Time.now.nsec
		File.open("#{LOG_DIR}#{timestamp.to_i}_#{SecureRandom.hex(3)}.json", 'w') do |f|
			f << JSON.pretty_generate({
				time: timestamp,
				completed: payload
			})
		end
	end

	def Log.create_fail_log(payload)
		timestamp = Time.now.nsec
		File.open("#{LOG_DIR}#{timestamp.to_i}_#{SecureRandom.hex(3)}_fail.json", 'w') do |f|
			f << payload
		end
	end
end