#!/usr/bin/env ruby
require_relative("helper_logs")

loaded_module = require_relative "source_#{ARGV[0]}.rb"
CONFIG = JSON.load File.new("./module/source_#{ARGV[0]}.json")

if(ARGV[1] === 'CACHE_MANGA')
	# DO SOMETHING
elsif(ARGV[1] === 'CACHE_LATEST')
	Source::cache_latest
elsif(ARGV[1] === 'CACHE_ALL')
	Source::cache_all(
		Integer(ARGV[2] ? Integer(ARGV[2]) : 0),
		Integer(ARGV[3] ? Integer(ARGV[3]) : 1)
	)
end