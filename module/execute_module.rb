#!/usr/bin/env ruby
require_relative("helper_logs")

loaded_module = require_relative "source_#{ARGV[0]}.rb"
CONFIG = JSON.load File.new("./module/source_#{ARGV[0]}.json")
CF = JSON.load File.new("./module/_cloudflare.json")

if(ARGV[1] === 'CACHE_MANGA')
	Source::read_manga(ARGV[2])
elsif(ARGV[1] === 'CACHE_CHAPTER_LIST')
	Source::read_chapter_list(ARGV[2])
elsif(ARGV[1] === 'CACHE_PAGE_LIST')
	Source::read_page_list(ARGV[2])
elsif(ARGV[1] === 'CACHE_LATEST')
	Source::read_latest()
elsif(ARGV[1] === 'CACHE_ALL')
	Source::read_directory(
		Integer(ARGV[2] ? Integer(ARGV[2]) : 0),
		Integer(ARGV[3] ? Integer(ARGV[3]) : 1)
	)
end