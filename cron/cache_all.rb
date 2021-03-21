#!/usr/bin/env ruby
require 'date'

require_relative '../db/db_connection'
require_relative '../db/model/source'
require_relative '../db/model/manga'

require_relative '../lib/source/source_list'

Source::SourceList.load_modules

threads = []

sources = $DB[:source].select(:alias, :enabled).where(:enabled).all
source_list = Source::SourceList.getSourceList
for source in sources
	threads << Thread.new { source_list["#{source[:alias]}"].full_sync }
end

threads.each(&:join)