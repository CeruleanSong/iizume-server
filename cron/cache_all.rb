#!/usr/bin/env ruby
require 'date'
require 'json'

require_relative '../db/db_connection'

require_relative '../lib/source/source_list'

Source::SourceList.load_modules

threads = []

sources = $DB[:source].select(:alias, :enabled).where(:enabled).all
source_list = Source::SourceList.getSourceList
for source in sources
	threads << Thread.new { source_list["#{source[:alias]}"].cache_all(ARGV[0]) }
end

threads.each(&:join)