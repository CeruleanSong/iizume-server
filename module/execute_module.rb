#!/usr/bin/env ruby
loaded_module = require_relative "source_#{ARGV[0]}.rb"

if(ARGV[1] === 'CACHE_LATEST')
	Source::cache_latest
end